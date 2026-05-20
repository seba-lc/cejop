import { NextRequest, NextResponse } from "next/server";
import { consumeMagicLink } from "@/lib/magic-links";
import { createCandeSession, CANDE_COOKIE_NAME } from "@/lib/cande-auth";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

const ACCESS_LOG = "cande_access_log";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const loginUrl = new URL("/cande/login", req.url);

  if (!token) {
    loginUrl.searchParams.set("error", "invalid");
    return NextResponse.redirect(loginUrl);
  }

  const email = await consumeMagicLink(token);
  if (!email) {
    loginUrl.searchParams.set("error", "expired");
    return NextResponse.redirect(loginUrl);
  }

  const jwt = await createCandeSession(email);

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    undefined;
  const ua = req.headers.get("user-agent") || undefined;

  try {
    const db = await getDb();
    await db.collection(ACCESS_LOG).insertOne({
      email,
      loggedInAt: new Date(),
      ip: ip || null,
      ua: ua || null,
    });
  } catch (err) {
    console.error("[cande/verify] access log error", err);
  }

  const dest = new URL("/cande/encuentro-1", req.url);
  const response = NextResponse.redirect(dest);
  response.cookies.set(CANDE_COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
