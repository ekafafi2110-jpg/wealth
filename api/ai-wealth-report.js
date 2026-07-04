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
    savingTips: [],
  },
  assetsAnalysis: {
    summary: "",
    positiveMovements: [],
    negativeMovements: [],
    allocationSuggestions: [],
  },
  marketOutlook: {
    summary: "",
    gold: "",
    stocks: "",
    cashAndDeposits: "",
    opportunities: [],
    risks: [],
    sources: [],
  },
  recommendations: [],
  nextActions: [],
  disclaimer:
    "هذا تحليل مساعد وليس نصيحة مالية أو استثمارية ملزمة. راجع مختصاً قبل أي قرار استثماري.",
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
  return Array.isArray(value)
    ? value.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
}

function asRecommendationArray(value) {
  return Array.isArray(value)
    ? value.slice(0, 8).map((item) => ({
        title: String(item?.title || "نصيحة"),
        description: String(item?.description || ""),
        priority: ["high", "medium", "low"].includes(item?.priority)
          ? item.priority
          : "medium",
      }))
    : [];
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
  const marketOutlook =
    report.marketOutlook && typeof report.marketOutlook === "object"
      ? report.marketOutlook
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
      savingTips: asStringArray(expenseAnalysis.savingTips).slice(0, 8),
    },
    assetsAnalysis: {
      summary: String(assetsAnalysis.summary || ""),
      positiveMovements: asStringArray(assetsAnalysis.positiveMovements).slice(0, 8),
      negativeMovements: asStringArray(assetsAnalysis.negativeMovements).slice(0, 8),
      allocationSuggestions: asStringArray(assetsAnalysis.allocationSuggestions).slice(0, 8),
    },
    marketOutlook: {
      summary: String(marketOutlook.summary || ""),
      gold: String(marketOutlook.gold || ""),
      stocks: String(marketOutlook.stocks || ""),
      cashAndDeposits: String(marketOutlook.cashAndDeposits || ""),
      opportunities: asStringArray(marketOutlook.opportunities).slice(0, 8),
      risks: asStringArray(marketOutlook.risks).slice(0, 8),
      sources: asStringArray(marketOutlook.sources).slice(0, 6),
    },
    recommendations: asRecommendationArray(report.recommendations),
    nextActions: asStringArray(report.nextActions).slice(0, 8),
    disclaimer: String(report.disclaimer || defaultReport.disclaimer),
  };
}

function buildPrompt(payload, { allowCurrentMarketSearch }) {
  return [
    "أنت محلل مالي شخصي داخل تطبيق إدارة ثروة ومصاريف.",
    "اكتب بالعربية بالكامل وبأسلوب مباشر ومفيد للمستخدم.",
    "حلّل بيانات المستخدم المرسلة فقط عند الحديث عن مصروفاته وأصوله. لا تخترع أرقاماً غير موجودة.",
    "قدّم نصائح توفير مصروفات عملية مبنية على أكبر بنود الصرف، تكرار الصرف، تجاوز السقف، وطريقة الدفع.",
    allowCurrentMarketSearch
      ? "استخدم البحث على الويب للاطلاع على أحدث الاتجاهات الاقتصادية العالمية المؤثرة على الذهب، الأسهم، السيولة، الفائدة، التضخم، والدولار. اذكر السياق العام بدون جزم."
      : "إذا لم يتوفر بحث ويب مباشر، قدّم قراءة سوقية عامة ومتحفظة واذكر أن السياق العالمي غير محدث لحظياً.",
    "اقترح توزيع أصول عام كنطاقات أو اتجاهات فقط، مثل زيادة السيولة أو تخفيف المخاطر أو تنويع الذهب والأسهم، ولا توصِ بشراء سهم أو أصل محدد.",
    "اذكر الفرص الاستثمارية كأفكار عامة للمراقبة لا كأوامر شراء: سيولة احتياطية، ذهب كتحوط، أسهم عريضة التنويع، ودائع/صناديق نقدية، أو انتظار هبوط مخاطر.",
    "ميّز بوضوح بين: نصائح توفير المصروفات، قراءة الأسواق، اقتراح توزيع الأصول، وخطوات الأسبوع القادم.",
    "إذا كانت البيانات ناقصة أو الفترة قصيرة، اذكر ذلك بوضوح.",
    "لا تغيّر أي بيانات في التطبيق. المطلوب تقرير تحليلي فقط.",
    "أعد JSON صالحاً فقط، بدون Markdown وبدون شرح خارج JSON.",
    "الشكل المطلوب بالضبط:",
    JSON.stringify(defaultReport),
    "بيانات المستخدم:",
    JSON.stringify(payload),
  ].join("\n");
}

async function requestOpenAiReport({ model, payload, allowCurrentMarketSearch }) {
  const requestBody = {
    model,
    input: buildPrompt(payload, { allowCurrentMarketSearch }),
    temperature: 0.2,
  };

  if (allowCurrentMarketSearch) {
    requestBody.tools = [{ type: "web_search" }];
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || `OpenAI request failed: ${response.status}`);
  }

  return normalizeReport(parseJsonOnly(extractText(data)));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    sendJson(res, 500, { error: "مفتاح الذكاء الاصطناعي غير مفعل على السيرفر." });
    return;
  }

  console.time("ai-wealth-report");
  try {
    const raw = await collectBody(req);
    const body = JSON.parse(raw || "{}");
    const model = process.env.OPENAI_REPORT_MODEL || "gpt-4o-mini";
    const allowWebSearch = process.env.OPENAI_REPORT_WEB_SEARCH !== "false";

    try {
      const report = await requestOpenAiReport({
        model,
        payload: body,
        allowCurrentMarketSearch: allowWebSearch,
      });
      sendJson(res, 200, report);
    } catch (error) {
      if (!allowWebSearch) throw error;
      const fallbackReport = await requestOpenAiReport({
        model,
        payload: body,
        allowCurrentMarketSearch: false,
      });
      sendJson(res, 200, {
        ...fallbackReport,
        marketOutlook: {
          ...fallbackReport.marketOutlook,
          summary:
            fallbackReport.marketOutlook.summary ||
            "تعذر استخدام البحث الاقتصادي الحي في هذه المحاولة، لذلك جاءت قراءة الأسواق عامة ومتحفظة.",
        },
      });
    }
  } catch {
    sendJson(res, 500, { error: "تعذر إعداد التقرير الذكي حالياً. حاول مرة أخرى." });
  } finally {
    console.timeEnd("ai-wealth-report");
  }
}
