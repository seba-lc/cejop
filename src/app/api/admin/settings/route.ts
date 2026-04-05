import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const SETTINGS_KEY = "encuestas_habilitadas";

export async function GET() {
  try {
    const db = await getDb();
    const setting = await db
      .collection("settings")
      .findOne({ key: SETTINGS_KEY });

    return NextResponse.json({
      encuestasHabilitadas: setting?.value ?? true,
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
    const { encuestasHabilitadas } = await req.json();

    if (typeof encuestasHabilitadas !== "boolean") {
      return NextResponse.json(
        { error: "encuestasHabilitadas debe ser boolean" },
        { status: 400 }
      );
    }

    const db = await getDb();
    await db.collection("settings").updateOne(
      { key: SETTINGS_KEY },
      { $set: { value: encuestasHabilitadas, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ encuestasHabilitadas });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Error al actualizar configuración" },
      { status: 500 }
    );
  }
}
