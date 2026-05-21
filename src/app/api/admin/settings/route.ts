import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  getEncuentroActivo,
  setEncuentroActivo,
  ENCUENTROS,
  type EncuentroId,
} from "@/lib/encuentro-config";

const KEY_ENCUESTAS = "encuestas_habilitadas";

export async function GET() {
  try {
    const db = await getDb();
    const habilitadasDoc = await db
      .collection("settings")
      .findOne({ key: KEY_ENCUESTAS });
    const encuentroActivo = await getEncuentroActivo();

    return NextResponse.json({
      encuestasHabilitadas: habilitadasDoc?.value ?? true,
      encuentroActivo,
    });
  } catch (error) {
    console.error("Error reading settings:", error);
    return NextResponse.json(
      { error: "Error al leer configuración" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.encuestasHabilitadas === "boolean") {
      const db = await getDb();
      await db.collection("settings").updateOne(
        { key: KEY_ENCUESTAS },
        { $set: { value: body.encuestasHabilitadas, updatedAt: new Date() } },
        { upsert: true }
      );
      updates.encuestasHabilitadas = body.encuestasHabilitadas;
    }

    if (typeof body.encuentroActivo === "string") {
      if (!(body.encuentroActivo in ENCUENTROS)) {
        return NextResponse.json(
          { error: `encuentroActivo inválido: ${body.encuentroActivo}` },
          { status: 400 }
        );
      }
      await setEncuentroActivo(body.encuentroActivo as EncuentroId);
      updates.encuentroActivo = body.encuentroActivo;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No hay campos válidos para actualizar" },
        { status: 400 }
      );
    }

    return NextResponse.json(updates);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}
