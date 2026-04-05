import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const setting = await db
      .collection("settings")
      .findOne({ key: "encuestas_habilitadas" });

    return NextResponse.json({
      habilitada: setting?.value ?? true,
    });
  } catch {
    return NextResponse.json({ habilitada: true });
  }
}
