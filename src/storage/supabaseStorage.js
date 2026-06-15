const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const STATE_ROW_ID = import.meta.env.VITE_SUPABASE_STATE_ROW_ID || "main";
const TABLE_NAME = "wealth_app_state";

function isConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function assertConfigured() {
  if (!isConfigured()) {
    throw new Error("Supabase is not configured. Check Vercel environment variables.");
  }
}

function endpoint(query = "") {
  return `${SUPABASE_URL}/rest/v1/${TABLE_NAME}${query}`;
}

function headers(extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export async function saveState(state) {
  assertConfigured();

  const response = await fetch(endpoint("?on_conflict=id"), {
    method: "POST",
    headers: headers({
      Prefer: "resolution=merge-duplicates",
    }),
    body: JSON.stringify({
      id: STATE_ROW_ID,
      state,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Supabase save failed: ${response.status}`);
  }
}

export async function loadState() {
  assertConfigured();

  const response = await fetch(
    endpoint(`?select=state&id=eq.${encodeURIComponent(STATE_ROW_ID)}&limit=1`),
    {
      headers: headers(),
    }
  );

  if (!response.ok) {
    throw new Error(`Supabase load failed: ${response.status}`);
  }

  const rows = await response.json();
  return rows?.[0]?.state || null;
}

export async function clearState() {
  assertConfigured();

  const response = await fetch(
    endpoint(`?id=eq.${encodeURIComponent(STATE_ROW_ID)}`),
    {
      method: "DELETE",
      headers: headers(),
    }
  );

  if (!response.ok) {
    throw new Error(`Supabase clear failed: ${response.status}`);
  }
}
