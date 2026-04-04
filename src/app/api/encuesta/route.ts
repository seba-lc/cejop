import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Basic validation
    const { personal, dirigentes, prioridades } = body;
    if (
      !personal?.nombre?.trim() ||
      !personal?.mail?.trim() ||
      !personal?.telefono?.trim() ||
      !personal?.edad ||
      !personal?.localidad?.trim()
    ) {
      return NextResponse.json(
        { error: "Datos personales incompletos" },
        { status: 400 }
      );
    }

    if (!dirigentes || !prioridades || prioridades.length < 3) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection("encuestas");

    // Check for existing submission by email or phone
    const mail = personal.mail.trim().toLowerCase();
    const telefono = personal.telefono.trim();

    const existing = await collection.findOne({
      $or: [
        { "personal.mail": mail },
        { "personal.telefono": telefono },
      ],
    });

    if (existing) {
      return NextResponse.json(
        {
          duplicate: true,
          message:
            "Ya recibimos una encuesta asociada a este email o número de teléfono. Tu participación quedó registrada correctamente.",
        },
        { status: 409 }
      );
    }

    const document = {
      ...body,
      personal: { ...personal, mail },
      createdAt: new Date(),
      encuentro: body.encuentro || null,
    };

    const result = await collection.insertOne(document);

    return NextResponse.json(
      { success: true, id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving encuesta:", error);
    return NextResponse.json(
      { error: "Error al guardar la encuesta" },
      { status: 500 }
    );
  }
}
