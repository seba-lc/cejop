import { render } from "@react-email/components";
import type { ReactElement } from "react";
import { getDb } from "@/lib/mongodb";
import { getResend, FROM } from "@/lib/resend";
import ConfirmacionAsistencia from "@/emails/confirmacion-asistencia";
import GraciasFeedback from "@/emails/gracias-feedback";

const SENDS_COLLECTION = "email_sends";

type SendResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
  id?: string;
};

async function sendOnce(params: {
  campaign: string;
  to: string;
  subject: string;
  component: ReactElement;
  meta?: Record<string, unknown>;
}): Promise<SendResult> {
  const { campaign, to, subject, component, meta } = params;
  const mail = to.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    return { ok: false, error: "Email inválido" };
  }

  const db = await getDb();
  const existing = await db
    .collection(SENDS_COLLECTION)
    .findOne({ campaign, mail, status: "sent" });
  if (existing) {
    return { ok: true, skipped: true, reason: "already sent" };
  }

  try {
    const html = await render(component);
    const text = await render(component, { plainText: true });

    const resend = getResend();
    const result = await resend.emails.send({
      from: FROM,
      to: mail,
      subject,
      html,
      text,
    });

    if (result.error) {
      await db.collection(SENDS_COLLECTION).insertOne({
        campaign,
        mail,
        status: "failed",
        error: result.error.message,
        meta: meta || null,
        sentAt: new Date(),
      });
      return { ok: false, error: result.error.message };
    }

    await db.collection(SENDS_COLLECTION).insertOne({
      campaign,
      mail,
      status: "sent",
      resendId: result.data?.id || null,
      meta: meta || null,
      sentAt: new Date(),
    });

    return { ok: true, id: result.data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    try {
      await db.collection(SENDS_COLLECTION).insertOne({
        campaign,
        mail,
        status: "failed",
        error: message,
        meta: meta || null,
        sentAt: new Date(),
      });
    } catch {
      // ignore secondary error
    }
    return { ok: false, error: message };
  }
}

export async function sendConfirmacionAsistencia(params: {
  mail: string;
  nombre: string;
}): Promise<SendResult> {
  const firstName = (params.nombre || "").split(" ")[0] || "";
  const subject = firstName
    ? `${firstName}, quedaste confirmado/a en el primer CEJOP`
    : "Quedaste confirmado/a en el primer CEJOP";

  return sendOnce({
    campaign: "confirmacion-encuentro-1",
    to: params.mail,
    subject,
    component: ConfirmacionAsistencia({ nombre: params.nombre }),
    meta: { nombre: params.nombre },
  });
}

export async function sendGraciasFeedback(params: {
  mail: string;
  nombre?: string;
}): Promise<SendResult> {
  return sendOnce({
    campaign: "gracias-feedback-encuentro-1",
    to: params.mail,
    subject: "Gracias por tu feedback",
    component: GraciasFeedback({ nombre: params.nombre || "" }),
    meta: params.nombre ? { nombre: params.nombre } : undefined,
  });
}
