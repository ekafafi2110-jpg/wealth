/* global Buffer, process */

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

const INVESTMENT_DISCLAIMER =
  "هذه ليست نصيحة مالية ملزمة ولا توصية شراء أو بيع مباشرة. القرار النهائي لك، والاستثمار يحمل مخاطر. الهدف من التقرير مساعدتك على رؤية الفرص والمخاطر بناءً على بياناتك، ويفضل مراجعة مختص قبل أي قرار استثماري كبير.";

const reportShape = {
  overallJudgment: "",
  financialHealthScore: {
    score: 0,
    label: "",
    reason: "",
  },
  financialDiagnosis: "",
  topProblems: [
    {
      title: "",
      reason: "",
      risk: "",
      decision: "",
    },
  ],
  immediateDecisions: [],
  nextWeekPlan: [],
  restOfMonthPlan: [],
  upcomingExpenses: [],
  savingPlan: [],
  assetsAnalysis: {
    summary: "",
    liquidityStatus: "",
    concentrationRisk: "",
    recommendations: [],
  },
  assetReturnOpportunities: [
    {
      opportunity: "",
      why: "",
      riskLevel: "",
      suggestedAmount: "",
      urgency: "",
      conditionBeforeAction: "",
      whatToWatch: "",
      conservativeAlternative: "",
    },
  ],
  doNotDoThisMonth: [],
  dataQuality: {
    status: "",
    missingData: [],
    message: "",
  },
  investmentDisclaimer: INVESTMENT_DISCLAIMER,
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

function asString(value) {
  return String(value || "").trim();
}

function asStringArray(value, max = 10) {
  return Array.isArray(value)
    ? value.map(asString).filter(Boolean).slice(0, max)
    : [];
}

function asProblemArray(value) {
  return Array.isArray(value)
    ? value.slice(0, 3).map((item) => ({
        title: asString(item?.title || item?.problem || "مشكلة مالية"),
        reason: asString(item?.reason),
        risk: asString(item?.risk),
        decision: asString(item?.decision),
      }))
    : [];
}

function asOpportunityArray(value) {
  return Array.isArray(value)
    ? value.slice(0, 5).map((item) => ({
        opportunity: asString(item?.opportunity),
        why: asString(item?.why),
        riskLevel: ["منخفضة", "متوسطة", "مرتفعة"].includes(item?.riskLevel)
          ? item.riskLevel
          : asString(item?.riskLevel || "متوسطة"),
        suggestedAmount: asString(item?.suggestedAmount),
        urgency: asString(item?.urgency),
        conditionBeforeAction: asString(item?.conditionBeforeAction),
        whatToWatch: asString(item?.whatToWatch),
        conservativeAlternative: asString(item?.conservativeAlternative),
      }))
    : [];
}

function normalizeReport(value) {
  const report = value && typeof value === "object" ? value : {};
  const scoreBlock =
    report.financialHealthScore && typeof report.financialHealthScore === "object"
      ? report.financialHealthScore
      : {};
  const assetsAnalysis =
    report.assetsAnalysis && typeof report.assetsAnalysis === "object"
      ? report.assetsAnalysis
      : {};
  const dataQuality =
    report.dataQuality && typeof report.dataQuality === "object"
      ? report.dataQuality
      : {};
  const score = Number(scoreBlock.score ?? report.healthScore ?? 0);

  return {
    overallJudgment: asString(report.overallJudgment || report.executiveSummary),
    financialHealthScore: {
      score: Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0)),
      label: asString(scoreBlock.label || report.status),
      reason: asString(scoreBlock.reason),
    },
    financialDiagnosis: asString(report.financialDiagnosis),
    topProblems: asProblemArray(report.topProblems),
    immediateDecisions: asStringArray(report.immediateDecisions, 8),
    nextWeekPlan: asStringArray(report.nextWeekPlan, 8),
    restOfMonthPlan: asStringArray(report.restOfMonthPlan, 8),
    upcomingExpenses: asStringArray(report.upcomingExpenses, 8),
    savingPlan: asStringArray(report.savingPlan, 8),
    assetsAnalysis: {
      summary: asString(assetsAnalysis.summary),
      liquidityStatus: asString(assetsAnalysis.liquidityStatus),
      concentrationRisk: asString(assetsAnalysis.concentrationRisk),
      recommendations: asStringArray(assetsAnalysis.recommendations, 8),
    },
    assetReturnOpportunities: asOpportunityArray(report.assetReturnOpportunities),
    doNotDoThisMonth: asStringArray(report.doNotDoThisMonth, 8),
    dataQuality: {
      status: asString(dataQuality.status),
      missingData: asStringArray(dataQuality.missingData, 8),
      message: asString(dataQuality.message),
    },
    investmentDisclaimer: asString(report.investmentDisclaimer) || INVESTMENT_DISCLAIMER,
  };
}

function buildPrompt(payload) {
  return [
    "أنت مستشار مالي محافظ لرب أسرة داخل تطبيق عربي لإدارة المال.",
    "مهمتك ليست تكرار البيانات، بل تحويلها إلى: تشخيص + قرار + خطة عمل + تحذير + فرصة.",
    "اكتب بالعربية بالكامل، بنبرة حازمة وعملية ومباشرة.",
    "اعتمد فقط على بيانات المستخدم المرسلة. لا تخترع أسعار سوق، ولا تزعم وجود فرصة سوقية إذا لم ترَ بيانات أسعار حقيقية.",
    "لا تعط توصية شراء أو بيع مباشرة. استخدم ألفاظ: ادرس، راقب، يمكن تخصيص جزء محدود، القرار النهائي لك.",
    "الأولوية: حماية سيولة الأسرة، الأقساط، المدارس، السيارة، الالتزامات، والطوارئ. تحسين العائد يأتي بعد حماية الأسرة.",
    "حلل المصاريف: أين المشكلة تحديداً؟ هل السبب مبلغ كبير واحد أم تكرار صغير؟ ما المبلغ المطلوب تخفيضه؟ ما الذي يوقف فوراً؟ ما الذي يؤجل؟",
    "حلل الأصول: هل السيولة قليلة أو زائدة؟ هل يوجد تركّز خطير؟ هل الذهب أو الأسهم أعلى من قدرة الأسرة؟ هل صندوق الطوارئ كاف؟",
    "قسم فرص تحسين العائد يجب أن يكون محافظاً ومشروطاً، ولا يقترح استثمار سيولة لازمة لالتزام خلال 60 يوم.",
    "إذا كانت البيانات قليلة، قل ذلك بوضوح لكن لا تكتفِ بعبارة عامة؛ أعط خطة لتحسين البيانات وحكم احترازي معقول.",
    "أعد JSON صالحاً فقط، بدون Markdown وبدون نص خارج JSON.",
    "الشكل المطلوب بالضبط:",
    JSON.stringify(reportShape),
    "يجب أن يظهر investmentDisclaimer بالنص التالي حرفياً:",
    INVESTMENT_DISCLAIMER,
    "بيانات المستخدم المضغوطة:",
    JSON.stringify(payload),
  ].join("\n");
}

async function requestOpenAiReport({ model, payload }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: buildPrompt(payload),
      temperature: 0.15,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || `OpenAI request failed: ${response.status}`);
  }

  const text = extractText(data);
  try {
    return normalizeReport(parseJsonOnly(text));
  } catch {
    return normalizeReport({
      overallJudgment: "تعذر تنظيم التقرير تلقائياً بالكامل، لكن تم استلام تحليل نصي من الذكاء الاصطناعي.",
      financialHealthScore: {
        score: 50,
        label: "يحتاج مراجعة",
        reason: "الاستجابة لم تكن بصيغة JSON منظمة.",
      },
      financialDiagnosis: String(text || "").slice(0, 1800),
      dataQuality: {
        status: "تحتاج مراجعة",
        missingData: ["أعد تشغيل التحليل إذا ظهر التقرير كنص غير منظم."],
        message: "تم عرض النص الخام بشكل آمن بدلاً من كسر شاشة التقرير.",
      },
      investmentDisclaimer: INVESTMENT_DISCLAIMER,
    });
  }
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
    const model =
      process.env.OPENAI_REPORT_MODEL ||
      process.env.OPENAI_WEALTH_REPORT_MODEL ||
      process.env.OPENAI_EXPENSE_MODEL ||
      "gpt-4o-mini";

    const report = await requestOpenAiReport({ model, payload: body });
    sendJson(res, 200, report);
  } catch (error) {
    sendJson(res, 500, {
      error:
        error.message ||
        "تعذر إعداد التقرير المالي المتخصص حالياً. حاول مرة أخرى بعد قليل.",
    });
  } finally {
    console.timeEnd("ai-wealth-report");
  }
}
