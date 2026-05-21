import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  getEncuentroActivo,
  ENCUENTRO_DEFAULT,
} from "@/lib/encuentro-config";

export async function GET() {
  try {
    const db = await getDb();
    const setting = await db
      .collection("settings")
      .findOne({ key: "encuestas_habilitadas" });
    const encuentroActivo = await getEncuentroActivo();

    return NextResponse.json({
      habilitada: setting?.value ?? true,
      encuentroActivo,
    });
  } catch {
    return NextResponse.json({
      habilitada: true,
      encuentroActivo: ENCUENTRO_DEFAULT,
    });
  }
}
