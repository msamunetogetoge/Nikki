import { decodeBase64, encodeBase64 } from "std/encoding/base64";
import { deleteCookie, getCookies, setCookie } from "std/http/cookie";
import { PublicUser } from "@domain/entities/User.ts";

const COOKIE_NAME = "auth_token";
const DEFAULT_MAX_AGE = 60 * 60 * 24; // 1 day
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSecret() {
  return Deno.env.get("AUTH_SECRET") ?? "dev-secret";
}

async function importKey(secret: string) {
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function serializeUser(user: PublicUser): string {
  return JSON.stringify(user);
}

const toBase64 = (data: Uint8Array) => encodeBase64(data);
const fromBase64 = (value: string) => decodeBase64(value);

async function sign(payload: string): Promise<string> {
  const key = await importKey(getSecret());
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );
  return toBase64(new Uint8Array(signature));
}

async function verifySignature(
  payload: string,
  signatureB64: string,
): Promise<boolean> {
  const key = await importKey(getSecret());
  const signatureBytes = fromBase64(signatureB64);
  return await crypto.subtle.verify(
    "HMAC",
    key,
    signatureBytes,
    encoder.encode(payload),
  );
}

async function createToken(user: PublicUser): Promise<string> {
  const payload = toBase64(encoder.encode(serializeUser(user)));
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

async function parseToken(token: string): Promise<PublicUser | null> {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const isValid = await verifySignature(payload, signature);
  if (!isValid) return null;

  try {
    const json = decoder.decode(fromBase64(payload));
    const user = JSON.parse(json) as PublicUser;
    return user;
  } catch (_err) {
    return null;
  }
}

export async function setAuthCookie(headers: Headers, user: PublicUser) {
  const token = await createToken(user);
  setCookie(headers, {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "Lax",
    secure: Deno.env.get("COOKIE_SECURE") === "true",
    path: "/",
    maxAge: DEFAULT_MAX_AGE,
  });
}

export function clearAuthCookie(headers: Headers) {
  deleteCookie(headers, COOKIE_NAME, { path: "/" });
}

export async function getUserFromRequest(
  request: Request,
): Promise<PublicUser | null> {
  const cookies = getCookies(request.headers);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return await parseToken(token);
}
