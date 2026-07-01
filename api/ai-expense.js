/* global Buffer, process */

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

function sendJson(res, status, payload) {
  res.status(status).setHeader("Content-Type", JSON_HEADERS["Content-Type"]);
  res.end(JSON.stringify(payload));
}

function parseDataUrl(dataUrl = "") {
  const match = String(dataUrl).match(/^data:([^;,]+)(?:;[^,]*)*;base64,([\s\S]+)$/);
  if (!match) return null;
  const mimeType = match[1].toLowerCase();
  const supportedMimeTypes = new Set([
    "audio/webm",
    "audio/mp4",
    "audio/mpeg",
    "audio/wav",
  ]);
  if (!supportedMimeTypes.has(mimeType)) return null;
  const base64 = match[2];
  return {
    mimeType,
    base64,
    buffer: Buffer.from(base64, "base64"),
  };
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

function parseSuggestion(text) {
  const cleaned = String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned);
  const first = Array.isArray(parsed.expenses) ? parsed.expenses[0] : parsed;
  return {
    amount: Number(first.amount || 0),
    category: String(first.category || "").trim(),
    note: String(first.note || first.merchant || parsed.summary || "").trim(),
    paymentMethodSuggestion: first.paymentMethodSuggestion || null,
    rawText: String(parsed.rawText || "").trim(),
    summary: String(parsed.summary || "").trim(),
    warnings: Array.isArray(first.warnings) ? first.warnings : [],
  };
}

function normalizeArabicDigits(text = "") {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return String(text).replace(/[٠-٩۰-۹]/g, (digit) => {
    const arabicIndex = arabicDigits.indexOf(digit);
    if (arabicIndex >= 0) return String(arabicIndex);
    return String(persianDigits.indexOf(digit));
  });
}

function parseArabicNumberWord(text = "") {
  const normalized = String(text).trim();
  const words = new Map([
    ["واحد", 1],
    ["واحدة", 1],
    ["اثنين", 2],
    ["إثنين", 2],
    ["اثنان", 2],
    ["إثنان", 2],
    ["ثلاثة", 3],
    ["ثلاث", 3],
    ["أربعة", 4],
    ["اربعة", 4],
    ["أربع", 4],
    ["اربع", 4],
    ["خمسة", 5],
    ["خمس", 5],
    ["ستة", 6],
    ["ست", 6],
    ["سبعة", 7],
    ["سبع", 7],
    ["ثمانية", 8],
    ["ثمان", 8],
    ["تسعة", 9],
    ["تسع", 9],
    ["عشرة", 10],
    ["عشر", 10],
    ["عشرين", 20],
    ["ثلاثين", 30],
    ["خمسين", 50],
    ["مئة", 100],
    ["مية", 100],
    ["مائة", 100],
  ]);
  for (const [word, value] of words) {
    if (normalized.includes(word)) return value;
  }
  return 0;
}

function resolvePaymentSuggestion(text = "", paymentMethods = []) {
  const normalized = String(text).toLowerCase();
  const findMethod = (matches) => {
    const method = paymentMethods.find((item) => {
      const value = String(item.value || "").toLowerCase();
      const label = String(item.label || "").toLowerCase();
      return matches.some((match) => value.includes(match) || label.includes(match));
    });
    return method?.value || null;
  };

  if (/(كاش|نقد|نقدي|cash)/i.test(normalized)) return findMethod(["cash", "كاش", "نقد"]) || "cash";
  if (/(بطاقة|فيزا|visa|card)/i.test(normalized)) return findMethod(["card", "بطاقة", "visa"]) || "card";
  if (/(أصل|اصل|asset)/i.test(normalized)) return findMethod(["asset", "أصل", "اصل"]) || "asset";
  return null;
}

function parseExpenseLocally(transcript, context = {}) {
  const text = normalizeArabicDigits(transcript);
  const categories = Array.isArray(context.categories) ? context.categories : [];
  const paymentMethods = Array.isArray(context.paymentMethods) ? context.paymentMethods : [];
  const numericMatch = text.match(/\b(\d+(?:[.,]\d+)?)\b/);
  const amount = numericMatch
    ? Number(numericMatch[1].replace(",", "."))
    : parseArabicNumberWord(text);

  const categoryAliases = new Map([
    ["طعام", ["طعام", "اكل", "أكل", "مطعم", "غداء", "عشاء", "فطور"]],
    ["بنزين", ["بنزين", "وقود", "محروقات"]],
    ["فواتير", ["فواتير", "فاتورة", "كهرباء", "ماء", "انترنت", "نت"]],
    ["مواصلات", ["مواصلات", "تاكسي", "تكسي", "باص", "اوبر", "أوبر"]],
    ["تسوق", ["تسوق", "سوق", "مشتريات"]],
    ["صحة", ["صحة", "دواء", "طبيب", "صيدلية"]],
    ["ترفيه", ["ترفيه", "لعبة", "سينما"]],
  ]);

  let category = categories.find((item) => text.includes(String(item || "").trim())) || "";
  if (!category) {
    for (const [fallbackCategory, aliases] of categoryAliases) {
      if (aliases.some((alias) => text.includes(alias))) {
        category = categories.find((item) => String(item || "").trim() === fallbackCategory) || fallbackCategory;
        break;
      }
    }
  }

  if (!amount || !category) return null;

  return {
    amount,
    category,
    note: transcript,
    paymentMethodSuggestion: resolvePaymentSuggestion(text, paymentMethods),
    rawText: transcript,
    summary: transcript,
    warnings: [],
  };
}

async function openAiJson({ model, input }) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input,
      temperature: 0,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || `OpenAI request failed: ${response.status}`);
  }

  return parseSuggestion(extractText(data));
}

function analysisPrompt({ mode, transcript, context }) {
  const categories = Array.isArray(context?.categories) ? context.categories : [];
  const paymentMethods = Array.isArray(context?.paymentMethods) ? context.paymentMethods : [];
  return [
    "أنت مساعد لاستخراج بيانات مصروف شخصي لتطبيق إدارة ثروة.",
    "أعد JSON صالحاً فقط بدون Markdown وبدون شرح.",
    "استخرج اقتراح تعبئة الحقول فقط، ولا تسجل مصروفاً ولا تغيّر أي بيانات.",
    "استخدم الأرقام الغربية دائماً.",
    `العملة الحالية: ${context?.currency || "JOD"}. تغيير العملة يعني تغيير الرمز فقط ولا يعني تحويل المبلغ.`,
    `التصنيفات المتاحة: ${categories.join(", ") || "غير مصنف"}. اختر أقرب تصنيف منها.`,
    `طرق الدفع المتاحة: ${paymentMethods.map((item) => `${item.value}=${item.label}`).join(", ") || "غير محددة"}.`,
    "إذا لم تكن طريقة الدفع واضحة اجعل paymentMethodSuggestion=null.",
    "صيغة JSON المطلوبة بالضبط:",
    '{"expenses":[{"amount":0,"category":"طعام","note":"","paymentMethodSuggestion":null,"merchant":"","needsReview":false,"warnings":[]}],"rawText":"","summary":""}',
    mode === "voice" ? `نص التسجيل الصوتي:\n${transcript || ""}` : "حلل صورة الفاتورة/الإيصال المرفقة.",
  ].join("\n");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    sendJson(res, 500, { error: "OPENAI_API_KEY is not configured on the server." });
    return;
  }

  console.time("ai-expense-total");
  try {
    const raw = await collectBody(req);
    const body = JSON.parse(raw || "{}");
    const mode = body.mode === "receipt" ? "receipt" : "voice";
    const context = body.context || {};
    const model = process.env.OPENAI_EXPENSE_MODEL || "gpt-4o-mini";

    if (mode === "voice") {
      console.log("audioDataUrl exists:", Boolean(body.audioDataUrl));
      console.log("audioDataUrl prefix:", body.audioDataUrl?.slice(0, 60));
      if (!body.audioDataUrl) {
        sendJson(res, 400, { error: "Missing audioDataUrl." });
        return;
      }
      const file = parseDataUrl(body.audioDataUrl);
      if (!file) {
        sendJson(res, 400, { error: "Invalid audio data URL." });
        return;
      }

      const form = new FormData();
      const transcribeModel = process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe";
      form.append("model", transcribeModel);
      form.append("file", new Blob([file.buffer], { type: file.mimeType }), "expense.webm");

      const transcriptionResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
        body: form,
      });
      const transcription = await transcriptionResponse.json().catch(() => ({}));
      if (!transcriptionResponse.ok) {
        throw new Error(transcription.error?.message || "تعذر تحويل الصوت إلى نص.");
      }

      const transcript = transcription.text || "";
      const localSuggestion = parseExpenseLocally(transcript, context);
      if (localSuggestion) {
        sendJson(res, 200, { ...localSuggestion, transcript });
        return;
      }
      const suggestion = await openAiJson({
        model,
        input: analysisPrompt({ mode, transcript, context }),
      });
      sendJson(res, 200, { ...suggestion, transcript });
      return;
    }

    if (mode === "receipt") {
      if (!body.imageDataUrl) {
        sendJson(res, 400, { error: "Missing imageDataUrl." });
        return;
      }

      const suggestion = await openAiJson({
        model,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: analysisPrompt({ mode, context }) },
              { type: "input_image", image_url: body.imageDataUrl },
            ],
          },
        ],
      });
      sendJson(res, 200, suggestion);
      return;
    }

    sendJson(res, 400, { error: "Unsupported mode." });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "AI expense extraction failed." });
  } finally {
    console.timeEnd("ai-expense-total");
  }
}
