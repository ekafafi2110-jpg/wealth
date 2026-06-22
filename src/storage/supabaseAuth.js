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

async function getUser(accessToken) {
  const response = await fetch(authEndpoint("user"), {
    headers: headers({
      Authorization: `Bearer ${accessToken}`,
    }),
  });

  return readAuthResponse(response);
}

export async function getSessionFromUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const queryParams = new URLSearchParams(window.location.search);
  const authError =
    hashParams.get("error_description") ||
    queryParams.get("error_description") ||
    hashParams.get("error") ||
    queryParams.get("error");
  const accessToken = hashParams.get("access_token") || queryParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token") || queryParams.get("refresh_token");

  if (authError) {
    window.history.replaceState({}, document.title, window.location.pathname);
    throw new Error(authError.replace(/\+/g, " "));
  }

  if (!accessToken) {
    return null;
  }

  const user = await getUser(accessToken);

  window.history.replaceState({}, document.title, window.location.pathname);

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: hashParams.get("token_type") || queryParams.get("token_type") || "bearer",
    expires_in: Number(hashParams.get("expires_in") || queryParams.get("expires_in") || 0),
    expires_at: Number(hashParams.get("expires_at") || queryParams.get("expires_at") || 0),
    user,
  };
}

export function authErrorMessage(error) {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("email not confirmed")) {
    return "البريد الإلكتروني غير مؤكد. افتح رسالة التحقق من البريد ثم حاول الدخول.";
  }

  if (message.includes("otp expired") || message.includes("expired")) {
    return "رابط التحقق منتهي. أنشئ الحساب أو اطلب رابطاً جديداً ثم افتح آخر رسالة وصلت إلى بريدك.";
  }

  if (message.includes("redirect") || message.includes("not allowed")) {
    return "رابط الرجوع غير مسموح في إعدادات Supabase. تأكد من Site URL و Redirect URLs.";
  }

  if (message.includes("invalid login credentials")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }

  if (message.includes("email rate limit") || message.includes("rate limit")) {
    return "تمت محاولات كثيرة خلال وقت قصير. انتظر قليلاً ثم حاول مرة أخرى.";
  }

  if (message.includes("supabase is not configured")) {
    return "إعدادات Supabase غير مكتملة في Vercel.";
  }

  return error?.message || "تعذر تسجيل الدخول. تأكد من البريد وكلمة المرور.";
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

export async function updatePassword(accessToken, password) {
  assertConfigured();

  const response = await fetch(authEndpoint("user"), {
    method: "PUT",
    headers: headers({ Authorization: `Bearer ${accessToken}` }),
    body: JSON.stringify({ password }),
  });

  return readAuthResponse(response);
}
