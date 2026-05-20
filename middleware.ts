import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE = "admin_session";
const CANDE_COOKIE = "cande_session";

const CANDE_PUBLIC_PATHS = new Set([
  "/cande/login",
  "/api/cande/request-link",
  "/api/cande/verify",
]);

const ADMIN_PUBLIC_PATHS = new Set([
  "/admin/login",
  "/api/admin/login",
  "/api/admin/logout",
]);

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return new TextEncoder().encode(secret);
}

async function verifyToken(
  token: string,
  expectedRole: "admin" | "cande_viewer",
): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === expectedRole;
  } catch {
    return false;
  }
}

function unauthorized(req: NextRequest, scope: "admin" | "cande") {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith("/api/");
  if (isApi) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const loginPath = scope === "admin" ? "/admin/login" : "/cande/login";
  return NextResponse.redirect(new URL(loginPath, req.url));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isCande =
    pathname.startsWith("/cande") || pathname.startsWith("/api/cande");
  const isAdmin =
    !isCande &&
    (pathname.startsWith("/admin") || pathname.startsWith("/api/admin"));

  if (isCande) {
    if (CANDE_PUBLIC_PATHS.has(pathname)) return NextResponse.next();
    const token = req.cookies.get(CANDE_COOKIE)?.value;
    if (!token || !(await verifyToken(token, "cande_viewer"))) {
      return unauthorized(req, "cande");
    }
    return NextResponse.next();
  }

  if (isAdmin) {
    if (ADMIN_PUBLIC_PATHS.has(pathname)) return NextResponse.next();
    const token = req.cookies.get(ADMIN_COOKIE)?.value;
    if (!token || !(await verifyToken(token, "admin"))) {
      return unauthorized(req, "admin");
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/cande/:path*",
    "/api/cande/:path*",
  ],
};
