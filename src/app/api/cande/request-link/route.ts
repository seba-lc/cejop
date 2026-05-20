import { NextRequest, NextResponse } from "next/server";
import { isCandeAllowed } from "@/lib/cande-auth";
import { createMagicLink, isRateLimited } from "@/lib/magic-links";
import { sendMagicLinkCande } from "@/lib/send-email";

export const runtime = "nodejs";

const GENERIC_RESPONSE = {
  ok: true,
  message:
    "Si tu email está autorizado, vas a recibir un link en los próximos minutos.",
};

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json().catch(() => ({ email: "" }));
    const normalized =
      typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalized || !isCandeAllowed(normalized)) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    if (await isRateLimited(normalized)) {
      return NextResponse.json(GENERIC_RESPONSE);
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      undefined;
    const ua = req.headers.get("user-agent") || undefined;

    const { url } = await createMagicLink(normalized, { ip, ua });
    await sendMagicLinkCande({ mail: normalized, url });

    return NextResponse.json(GENERIC_RESPONSE);
  } catch (err) {
    console.error("[cande/request-link] error", err);
    return NextResponse.json(GENERIC_RESPONSE);
  }
}
