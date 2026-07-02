/* global Buffer, process */

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

const defaultReport = {
  title: "تقرير الثروة الذكي",
  executiveSummary: "",
  healthScore: 0,
  status: "يحتاج انتباه",
  keyInsights: [],
  expenseAnalysis: {
    summary: "",
    highestCategories: [],
    warnings: [],
  },
  assetsAnalysis: {
    summary: "",
    positiveMovements: [],
    negativeMovements: [],
  },
  recommendations: [],
  nextActions: [],
  disclaimer: "هذا تحليل مساعد وليس نصيحة مالية أو استثمارية ملزمة.",
};

function sendJson(res, status, payload) {
  res.status(status).setHeader("Content-Type", JSON_HEADERS["Content-Type"]);
  res.end(JSON.stringify(payload));
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function extractText(response) {
  if (response.output_text) return response.output_text;
  const parts = [];
  for (const item of response.output || []) {
    for (const content of item.content || []) {
      if (content.text) parts.push(content.text);
    }
  }
  return parts.join("\n");
}

function parseJsonOnly(text) {
  const cleaned = String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

function asStringArray(value) {
  return Array.isArray(value) ? value.map((item) => String(item || "").trim()).filter(Boolean) : [];
}

function normalizeReport(value) {
  const report = value && typeof value === "object" ? value : {};
  const expenseAnalysis =
    report.expenseAnalysis && typeof report.expenseAnalysis === "object"
      ? report.expenseAnalysis
      : {};
  const assetsAnalysis =
    report.assetsAnalysis && typeof report.assetsAnalysis === "object"
      ? report.assetsAnalysis
      : {};

  return {
    ...defaultReport,
    title: String(report.title || defaultReport.title),
    executiveSummary: String(report.executiveSummary || ""),
    healthScore: Math.max(0, Math.min(100, Number(report.healthScore || 0))),
    status: ["جيد", "يحتاج انتباه", "خطر"].includes(report.status)
      ? report.status
      : defaultReport.status,
    keyInsights: asStringArray(report.keyInsights).slice(0, 8),
    expenseAnalysis: {
      summary: String(expenseAnalysis.summary || ""),
      highestCategories: asStringArray(expenseAnalysis.highestCategories).slice(0, 8),
      warnings: asStringArray(expenseAnalysis.warnings).slice(0, 8),
    },
    assetsAnalysis: {
      summary: String(assetsAnalysis.summary || ""),
      positiveMovements: asStringArray(assetsAnalysis.positiveMovements).slice(0, 8),
      negativeMovements: asStringArray(assetsAnalysis.negativeMovements).slice(0, 8),
    },
    recommendations: Array.isArray(report.recommendations)
      ? report.recommendations.slice(0, 8).map((item) => ({
          title: String(item?.title || "نصيحة"),
          description: String(item?.description || ""),
          priority: ["high", "medium", "low"].includes(item?.priority)
            ? item.priority
            : "medium",
        }))
      : [],
    nextActions: asStringArray(report.nextActions).slice(0, 8),
    disclaimer: String(report.disclaimer || defaultReport.disclaimer),
  };
}

function buildPrompt(payload) {
  return [
    "أنت محلل مالي شخصي داخل تطبيق إدارة ثروة ومصاريف.",
    "حلّل البيانات المجمعة التالية فقط، ولا تفترض أو تخترع أرقاماً غير موجودة.",
    "اكتب بالعربية بالكامل وبأسلوب واضح ومباشر ومفيد للمستخدم.",
    "لا توصِ بشراء سهم أو أصل محدد، ولا تعطِ نصيحة مالية أو استثمارية ملزمة.",
    "ركّز على إدارة المصروف، السيولة، سقف الصرف، الادخار، توزيع الأصول، الالتزامات، والمخاطر.",
    "إذا كانت البيانات ناقصة أو الفترة قصيرة، اذكر ذلك بوضوح.",
    "لا تغيّر أي بيانات في التطبيق. المطلوب تقرير تحليلي فقط.",
    "أعد JSON صالحاً فقط، بدون Markdown وبدون شرح خارج JSON.",
    "الشكل المطلوب بالضبط:",
    JSON.stringify(defaultReport),
    "البيانات المجمعة:",
    JSON.stringify(payload),
  ].join("\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    sendJson(res, 500, { error: "مفتاح الذكاء الاصطناعي غير مفعّل على السيرفر." });
    return;
  }

  console.time("ai-wealth-report");
  try {
    const raw = await collectBody(req);
    const body = JSON.parse(raw || "{}");
    const model = process.env.OPENAI_REPORT_MODEL || "gpt-4o-mini";

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: buildPrompt(body),
        temperature: 0.2,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error?.message || `OpenAI request failed: ${response.status}`);
    }

    const parsed = parseJsonOnly(extractText(data));
    sendJson(res, 200, normalizeReport(parsed));
  } catch {
    sendJson(res, 500, { error: "تعذر إعداد التقرير الذكي حالياً. حاول مرة أخرى." });
  } finally {
    console.timeEnd("ai-wealth-report");
  }
}
