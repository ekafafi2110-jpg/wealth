const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const AUTH_REDIRECT_URL = import.meta.env.VITE_AUTH_REDIRECT_URL;

function assertConfigured() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase is not configured. Check Vercel environment variables.");
  }
}

function authEndpoint(path) {
  return `${SUPABASE_URL}/auth/v1/${path}`;
}

function currentAppUrl() {
  if (AUTH_REDIRECT_URL) {
    return AUTH_REDIRECT_URL;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "";
}

function authEndpointWithRedirect(path) {
  const redirectUrl = currentAppUrl();

  if (!redirectUrl) {
    return authEndpoint(path);
  }

  return authEndpoint(`${path}?redirect_to=${encodeURIComponent(redirectUrl)}`);
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

  const response = await fetch(authEndpointWithRedirect("signup"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email, password }),
  });

  return readAuthResponse(response);
}

export async function resetPasswordForEmail(email) {
  assertConfigured();

  const response = await fetch(authEndpointWithRedirect("recover"), {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email }),
  });

  return readAuthResponse(response);
}
