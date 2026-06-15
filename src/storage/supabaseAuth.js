const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function assertConfigured() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase is not configured. Check Vercel environment variables.");
  }
}

function authEndpoint(path) {
  return `${SUPABASE_URL}/auth/v1/${path}`;
}

function headers(extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function readAuthResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error_description || data.msg || data.message || "Supabase auth failed");
  }

  return data;
}

export async function signInWithPassword(email, password) {
  assertConfigured();

  const response = await fetch(authEndpoint("token?grant_type=password"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email, password }),
  });

  return readAuthResponse(response);
}

export async function signUpWithPassword(email, password) {
  assertConfigured();

  const response = await fetch(authEndpoint("signup"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email, password }),
  });

  return readAuthResponse(response);
}
