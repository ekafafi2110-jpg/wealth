const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const STATE_KEY = import.meta.env.VITE_SUPABASE_STATE_ROW_ID || "main";
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

function assertSession(session) {
  if (!session?.access_token || !session?.user?.id) {
    throw new Error("Supabase user session is missing.");
  }
}

function stateRowId(userId) {
  return `${userId}:${STATE_KEY}`;
}

function headers(session, extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

export async function saveState(state, session) {
  assertConfigured();
  assertSession(session);

  const response = await fetch(endpoint("?on_conflict=id"), {
    method: "POST",
    headers: headers(session, {
      Prefer: "resolution=merge-duplicates",
    }),
    body: JSON.stringify({
      id: stateRowId(session.user.id),
      user_id: session.user.id,
      state_key: STATE_KEY,
      state,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Supabase save failed: ${response.status}`);
  }
}

export async function loadState(session) {
  assertConfigured();
  assertSession(session);

  const response = await fetch(
    endpoint(
      `?select=state&user_id=eq.${encodeURIComponent(session.user.id)}&state_key=eq.${encodeURIComponent(STATE_KEY)}&limit=1`
    ),
    {
      headers: headers(session),
    }
  );

  if (!response.ok) {
    throw new Error(`Supabase load failed: ${response.status}`);
  }

  const rows = await response.json();
  return rows?.[0]?.state || null;
}

export async function clearState(session) {
  assertConfigured();
  assertSession(session);

  const response = await fetch(
    endpoint(
      `?user_id=eq.${encodeURIComponent(session.user.id)}&state_key=eq.${encodeURIComponent(STATE_KEY)}`
    ),
    {
      method: "DELETE",
      headers: headers(session),
    }
  );

  if (!response.ok) {
    throw new Error(`Supabase clear failed: ${response.status}`);
  }
}
