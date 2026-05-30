import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendGraciasFeedback } from "@/lib/send-email";
import { getEncuentroActivo, getEncuentro, colName } from "@/lib/encuentro-config";

// POST /api/feedback
// Endpoint dinámico: escribe el feedback contra el encuentro ACTIVO
// (server-authoritative — el encuentro lo resuelve el server, no el cliente).
// Así un único path/QR sirve para cualquier encuentro sin tocar código.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const mail = typeof body.mail === "string" ? body.mail.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    if (typeof body.nps !== "number" || body.nps < 1 || body.nps > 10) {
      return NextResponse.json(
        { error: "Calificación inválida" },
        { status: 400 }
      );
    }

    if (typeof body.teLlevas !== "string" || !body.teLlevas.trim()) {
      return NextResponse.json(
        { error: "Falta responder qué te llevás del encuentro" },
        { status: 400 }
      );
    }

    if (!["si", "talvez", "no"].includes(body.recomendaria)) {
      return NextResponse.json(
        { error: "Falta responder si recomendarías el CEJOP" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const encuentroId = await getEncuentroActivo();
    const collection = db.collection(colName("feedback", encuentroId));

    const existing = await collection.findOne({ mail });
    if (existing) {
      const ordinal = getEncuentro(encuentroId).ordinal;
      return NextResponse.json(
        {
          duplicate: true,
          message: `Ya recibimos tu feedback sobre el ${ordinal} encuentro. Tu respuesta quedó registrada correctamente.`,
        },
        { status: 409 }
      );
    }

    const document = {
      mail,
      nps: body.nps,
      teLlevas: body.teLlevas.trim(),
      mejorarias: typeof body.mejorarias === "string" ? body.mejorarias.trim() : "",
      proximoTemas: Array.isArray(body.proximoTemas) ? body.proximoTemas : [],
      proximoOtro: typeof body.proximoOtro === "string" ? body.proximoOtro.trim() : "",
      recomendaria: body.recomendaria,
      origenPolitico: typeof body.origenPolitico === "string" ? body.origenPolitico.trim() : "",
      encuentro: encuentroId,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(document);

    // Disparar email de gracias. Busca el nombre en encuestas si hay match,
    // si no manda genérico. El helper tiene dedup propio (campaign + mail).
    try {
      const encuesta = await db
        .collection("encuestas")
        .findOne({ encuentroId, "personal.mail": mail });
      const nombre = encuesta?.personal?.nombre || "";
      await sendGraciasFeedback({ mail, nombre, encuentroId });
    } catch (err) {
      console.error("Error enviando email de gracias por feedback:", err);
      // No rompe la respuesta al usuario.
    }

    return NextResponse.json(
      { success: true, id: result.insertedId, encuentro: encuentroId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json(
      { error: "Error al guardar el feedback" },
      { status: 500 }
    );
  }
}
