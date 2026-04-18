import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";
import { getResend, FROM } from "@/lib/resend";
import TestPing from "@/emails/test-ping";

export async function POST(req: NextRequest) {
  try {
    const { mail } = await req.json();
    const to = String(mail || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    const timestamp = new Date().toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const component = TestPing({ timestamp });
    const html = await render(component);
    const text = await render(component, { plainText: true });

    const resend = getResend();
    const result = await resend.emails.send({
      from: FROM,
      to,
      subject: `[TEST] CEJOP · ${timestamp}`,
      html,
      text,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message || "Error al enviar" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: result.data?.id,
      timestamp,
    });
  } catch (error) {
    console.error("Error POST /api/admin/test-email:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error al enviar test",
      },
      { status: 500 }
    );
  }
}
