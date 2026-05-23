import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  ENCUENTROS,
  getEncuentroActivo,
  type EncuentroId,
} from "@/lib/encuentro-config";

function isValidId(value: unknown): value is EncuentroId {
  return typeof value === "string" && value in ENCUENTROS;
}

export async function POST(req: NextRequest) {
  try {
    const db = await getDb();
    const setting = await db
      .collection("settings")
      .findOne({ key: "encuestas_habilitadas" });
    if (setting && setting.value === false) {
      return NextResponse.json(
        { error: "Las encuestas están cerradas en este momento" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const requestedId: EncuentroId = isValidId(body.encuentroId)
      ? body.encuentroId
      : await getEncuentroActivo();
    const encuentroActivo = await getEncuentroActivo();

    // Si llega un POST a un encuentro que no es el vigente, rechazamos.
    // Cubre el caso de que alguien tenga abierta la página de un encuentro
    // anterior mientras admin cambió el activo desde el dashboard.
    if (requestedId !== encuentroActivo) {
      return NextResponse.json(
        {
          error: `Las inscripciones al ${ENCUENTROS[requestedId].ordinal} encuentro están cerradas.`,
        },
        { status: 403 }
      );
    }

    const encuentroId = requestedId;

    const { personal, dirigentes, prioridades, fueAlPrimero } = body;
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

    if (encuentroId === "e2" && typeof fueAlPrimero !== "boolean") {
      return NextResponse.json(
        { error: "Falta indicar si participaste del primer encuentro" },
        { status: 400 }
      );
    }

    if (
      encuentroId === "e2" &&
      (!Array.isArray(body.ejesEncuentro) || body.ejesEncuentro.length < 3)
    ) {
      return NextResponse.json(
        { error: "Faltan los 3 ejes del 2do encuentro" },
        { status: 400 }
      );
    }

    const collection = db.collection("encuestas");

    const mail = personal.mail.trim().toLowerCase();
    const telefono = personal.telefono.trim();

    // El duplicado se chequea por encuentroId: una misma persona puede
    // inscribirse a encuentros distintos sin que el primero le bloquee el segundo.
    const existing = await collection.findOne({
      encuentroId,
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
      encuentroId,
      ...(encuentroId === "e2" ? { fueAlPrimero: !!fueAlPrimero } : {}),
      createdAt: new Date(),
    };
    delete (document as Record<string, unknown>).encuentro;

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
