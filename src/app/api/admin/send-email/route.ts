import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/components";
import { getDb } from "@/lib/mongodb";
import { getResend, FROM } from "@/lib/resend";
import GraciasInscripto from "@/emails/gracias-inscripto";
import GraciasAsistente from "@/emails/gracias-asistente";

const ASISTENTES_COLLECTION = "asistentes_encuentro_1";
const SENDS_COLLECTION = "email_sends";

const CAMPAIGN_ID = "gracias-encuentro-1";

type Tipo = "confirmado" | "inscripto_no_confirmado" | "walk_in";

function templateForTipo(tipo: Tipo, nombre: string) {
  if (tipo === "walk_in") {
    return {
      subject: "Gracias por estar en el primer CEJOP",
      component: GraciasAsistente({ nombre }),
      templateId: "gracias-asistente",
    };
  }
  const firstName = nombre.split(" ")[0] || "";
  return {
    subject: firstName
      ? `${firstName}, hoy empezó algo distinto`
      : "Gracias por estar en el primer CEJOP",
    component: GraciasInscripto({ nombre }),
    templateId: "gracias-inscripto",
  };
}

// GET /api/admin/send-email?campaign=gracias-encuentro-1
// Preview: returns the list of recipients classified by type, with "already sent" flag
export async function GET() {
  try {
    const db = await getDb();
    const [asistentes, sends] = await Promise.all([
      db.collection(ASISTENTES_COLLECTION).find({}).sort({ createdAt: 1 }).toArray(),
      db
        .collection(SENDS_COLLECTION)
        .find({ campaign: CAMPAIGN_ID })
        .toArray(),
    ]);

    const sentMap = new Map(sends.map((s) => [s.mail, s]));
    const items = asistentes.map((a) => ({
      mail: a.mail,
      nombre: a.nombre,
      tipo: a.tipo as Tipo,
      yaEnviado: !!sentMap.get(a.mail),
      enviadoAt: sentMap.get(a.mail)?.sentAt || null,
      status: sentMap.get(a.mail)?.status || null,
    }));

    const counts = {
      total: items.length,
      confirmado: items.filter((i) => i.tipo === "confirmado").length,
      inscripto_no_confirmado: items.filter(
        (i) => i.tipo === "inscripto_no_confirmado"
      ).length,
      walk_in: items.filter((i) => i.tipo === "walk_in").length,
      enviados: items.filter((i) => i.yaEnviado && i.status === "sent").length,
      pendientes: items.filter((i) => !i.yaEnviado).length,
      fallidos: items.filter((i) => i.status === "failed").length,
    };

    return NextResponse.json({ items, counts });
  } catch (error) {
    console.error("Error GET /api/admin/send-email:", error);
    return NextResponse.json(
      { error: "Error al listar destinatarios" },
      { status: 500 }
    );
  }
}

// POST /api/admin/send-email
// Body:
//   { mode: "test", mail: "admin@kuranda.com.ar", tipo: "confirmado" | "inscripto_no_confirmado" | "walk_in" }
//   { mode: "send", emails?: string[] }   // if emails omitted, sends to all pending
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.mode === "test") {
      const mail = String(body.mail || "").trim().toLowerCase();
      const tipo = (body.tipo || "confirmado") as Tipo;
      const nombre = String(body.nombre || "Seba").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
        return NextResponse.json(
          { error: "Email inválido" },
          { status: 400 }
        );
      }
      const { subject, component } = templateForTipo(tipo, nombre);
      const html = await render(component);
      const text = await render(component, { plainText: true });

      const resend = getResend();
      const result = await resend.emails.send({
        from: FROM,
        to: mail,
        subject: `[TEST] ${subject}`,
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
      });
    }

    if (body.mode === "send") {
      const db = await getDb();
      const sends = await db
        .collection(SENDS_COLLECTION)
        .find({ campaign: CAMPAIGN_ID, status: "sent" })
        .toArray();
      const sentMails = new Set(sends.map((s) => s.mail));

      let candidates = await db
        .collection(ASISTENTES_COLLECTION)
        .find({})
        .toArray();

      if (Array.isArray(body.emails) && body.emails.length > 0) {
        const filterSet = new Set(
          body.emails.map((e: string) => e.trim().toLowerCase())
        );
        candidates = candidates.filter((c) => filterSet.has(c.mail));
      }

      candidates = candidates.filter((c) => !sentMails.has(c.mail));

      const resend = getResend();
      let ok = 0;
      let failed = 0;

      // Rate limit: Resend free tier allows 2 req/s. We send one by one with a small delay.
      for (const a of candidates) {
        try {
          const { subject, component, templateId } = templateForTipo(
            a.tipo as Tipo,
            a.nombre || ""
          );
          const html = await render(component);
          const text = await render(component, { plainText: true });

          const result = await resend.emails.send({
            from: FROM,
            to: a.mail,
            subject,
            html,
            text,
          });

          if (result.error) {
            await db.collection(SENDS_COLLECTION).insertOne({
              campaign: CAMPAIGN_ID,
              mail: a.mail,
              tipo: a.tipo,
              templateId,
              status: "failed",
              error: result.error.message,
              sentAt: new Date(),
            });
            failed++;
          } else {
            await db.collection(SENDS_COLLECTION).insertOne({
              campaign: CAMPAIGN_ID,
              mail: a.mail,
              tipo: a.tipo,
              templateId,
              status: "sent",
              resendId: result.data?.id,
              sentAt: new Date(),
            });
            ok++;
          }
        } catch (err) {
          console.error("Error enviando a", a.mail, err);
          try {
            await db.collection(SENDS_COLLECTION).insertOne({
              campaign: CAMPAIGN_ID,
              mail: a.mail,
              tipo: a.tipo,
              status: "failed",
              error: err instanceof Error ? err.message : "unknown",
              sentAt: new Date(),
            });
          } catch {
            // ignore secondary error
          }
          failed++;
        }

        // small pause to respect Resend's 2 req/s rate limit
        await new Promise((r) => setTimeout(r, 600));
      }

      return NextResponse.json({
        success: true,
        sent: ok,
        failed,
        totalProcessed: candidates.length,
      });
    }

    return NextResponse.json(
      { error: "mode inválido (usa 'test' o 'send')" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error POST /api/admin/send-email:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al enviar" },
      { status: 500 }
    );
  }
}
