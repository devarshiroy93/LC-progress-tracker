const encoder = new TextEncoder();

export const SESSION_COOKIE_NAME = "dsa_recall_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

type SessionPayload = {
  sub: string;
  email: string;
  exp: number;
};

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret) {
    throw new Error("AUTH_SESSION_SECRET is not set");
  }

  return secret;
}

function toBase64Url(input: string) {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const padded = padding === 0 ? normalized : normalized + "=".repeat(4 - padding);
  return atob(padded);
}

async function importHmacKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSessionSecret()),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign", "verify"]
  );
}

async function signValue(value: string) {
  const key = await importHmacKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(String.fromCharCode(...new Uint8Array(signature)));
}

function parsePayload(token: string) {
  const parts = token.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, encodedSignature] = parts;

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionPayload;
    return { payload, encodedPayload, encodedSignature };
  } catch {
    return null;
  }
}

export async function createSessionToken(user: { id: string; email: string }) {
  const payload: SessionPayload = {
    sub: user.id,
    email: user.email,
    exp: Date.now() + SESSION_DURATION_MS,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const encodedSignature = await signValue(encodedPayload);

  return `${encodedPayload}.${encodedSignature}`;
}

export async function verifySessionToken(token: string) {
  const parsed = parsePayload(token);

  if (!parsed) {
    return null;
  }

  const key = await importHmacKey();
  const isValid = await crypto.subtle.verify(
    "HMAC",
    key,
    Uint8Array.from(fromBase64Url(parsed.encodedSignature), (char) =>
      char.charCodeAt(0)
    ),
    encoder.encode(parsed.encodedPayload)
  );

  if (!isValid || parsed.payload.exp < Date.now()) {
    return null;
  }

  return parsed.payload;
}

export function getSessionCookieHeader(token: string) {
  const maxAge = Math.floor(SESSION_DURATION_MS / 1000);
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";

  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge};${secure}`;
}

export function getExpiredSessionCookieHeader() {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;${secure}`;
}
