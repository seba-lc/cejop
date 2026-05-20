import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const CANDE_COOKIE_NAME = "cande_session";

const CANDE_SESSION_TTL = "30d";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return new TextEncoder().encode(secret);
}

export type CandeSession = {
  role: "cande_viewer";
  email: string;
};

export async function createCandeSession(email: string): Promise<string> {
  return new SignJWT({ role: "cande_viewer", email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(CANDE_SESSION_TTL)
    .sign(getSecret());
}

export async function verifyCandeSession(
  token: string,
): Promise<CandeSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "cande_viewer" || typeof payload.email !== "string") {
      return null;
    }
    return { role: "cande_viewer", email: payload.email };
  } catch {
    return null;
  }
}

export async function getCandeSessionFromCookies(): Promise<CandeSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CANDE_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyCandeSession(token);
}

export function getCandeAllowlist(): string[] {
  const raw = process.env.CANDE_ALLOWED_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isCandeAllowed(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  return getCandeAllowlist().includes(normalized);
}
