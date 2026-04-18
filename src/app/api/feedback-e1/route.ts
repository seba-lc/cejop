import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

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
    const collection = db.collection("feedback_encuentro_1");

    const existing = await collection.findOne({ mail });
    if (existing) {
      return NextResponse.json(
        {
          duplicate: true,
          message:
            "Ya recibimos tu feedback sobre el primer encuentro. Tu respuesta quedó registrada correctamente.",
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
      encuentro: "e1",
      createdAt: new Date(),
    };

    const result = await collection.insertOne(document);

    return NextResponse.json(
      { success: true, id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving feedback-e1:", error);
    return NextResponse.json(
      { error: "Error al guardar el feedback" },
      { status: 500 }
    );
  }
}
