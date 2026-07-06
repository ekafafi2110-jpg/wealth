/* global Buffer, process */

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

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

function normalizeResult(value) {
  const result = value && typeof value === "object" ? value : {};
  const type = ["expense", "income", "refund", "transfer", "declined", "unknown"].includes(result.type)
    ? result.type
    : "unknown";
  const amount = Number(result.amount || 0);
  const confidence = Math.max(0, Math.min(1, Number(result.confidence || 0)));

  return {
    type,
    confidence,
    amount: Number.isFinite(amount) ? amount : 0,
    currency: asString(result.currency),
    merchant: asString(result.merchant),
    category: asString(result.category),
    paymentMethodSuggestion: result.paymentMethodSuggestion || null,
    note: asString(result.note),
    date: asString(result.date),
    summary: asString(result.summary),
    warnings: Array.isArray(result.warnings)
      ? result.warnings.map(asString).filter(Boolean).slice(0, 6)
      : [],
  };
}

function buildPrompt({ message, context }) {
  const categories = Array.isArray(context?.categories) ? context.categories : [];
  const paymentMethods = Array.isArray(context?.paymentMethods) ? context.paymentMethods : [];

  return [
    "You extract structured data from bank/SMS/card transaction messages for a personal expense tracker.",
    "Return valid JSON only. No markdown. Do not invent values.",
    "The app will NOT register anything automatically; it only pre-fills fields for user review.",
    "Classify the message type carefully:",
    "- expense: actual card/account debit, purchase, POS, online payment, withdrawal, fee, or charge.",
    "- income: salary, deposit, incoming transfer, or credit that is not a refund.",
    "- refund: reversal, cashback, returned amount, or merchant refund.",
    "- transfer: movement between own accounts/cards when not clearly a purchase.",
    "- declined: rejected/failed transaction.",
    "- unknown: not enough evidence.",
    "If the message includes both transaction amount and remaining balance, use the transaction amount only.",
    "If there are fees plus a purchase amount, use the main purchase/debit amount and mention fees in warnings.",
    "If type is not expense, still return amount if clear, but leave category empty and paymentMethodSuggestion null.",
    `Current app currency: ${context?.currency || "JOD"}. Do not convert currencies.`,
    `Available categories: ${categories.join(", ") || "غير مصنف"}. Pick the closest exact category label when type is expense.`,
    `Available payment methods: ${paymentMethods.map((item) => `${item.value}=${item.label}`).join(", ") || "none"}.`,
    "Use paymentMethodSuggestion='card' for card/POS/online card messages when available; 'bank' only if available and message clearly says account debit; otherwise null.",
    "Required JSON shape:",
    JSON.stringify({
      type: "expense",
      confidence: 0,
      amount: 0,
      currency: "JOD",
      merchant: "",
      category: "",
      paymentMethodSuggestion: null,
      note: "",
      date: "",
      summary: "",
      warnings: [],
    }),
    "Bank message:",
    String(message || ""),
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

  try {
    const raw = await collectBody(req);
    const body = JSON.parse(raw || "{}");
    const message = asString(body.message);
    if (!message) {
      sendJson(res, 400, { error: "Missing bank message text." });
      return;
    }

    const model = process.env.OPENAI_BANK_MESSAGE_MODEL || process.env.OPENAI_EXPENSE_MODEL || "gpt-4o-mini";
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: buildPrompt({ message, context: body.context || {} }),
        temperature: 0,
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error?.message || `OpenAI request failed: ${response.status}`);
    }

    sendJson(res, 200, normalizeResult(parseJsonOnly(extractText(data))));
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Bank message analysis failed." });
  }
}
