import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const ASISTENTES_COLLECTION = "asistentes_encuentro_1";

type AsistenteTipo = "confirmado" | "inscripto_no_confirmado" | "walk_in";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const tipoFilter = searchParams.get("tipo") || "all";

    const db = await getDb();
    const docs = await db
      .collection(ASISTENTES_COLLECTION)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    let items = docs.map((a) => ({
      id: String(a._id),
      mail: a.mail,
      nombre: a.nombre,
      telefono: a.telefono || "",
      tipo: a.tipo as AsistenteTipo,
      inscripto: !!a.inscripto,
      confirmado: !!a.confirmado,
      createdAt: a.createdAt || null,
    }));

    const counts = {
      total: items.length,
      confirmado: items.filter((i) => i.tipo === "confirmado").length,
      inscripto_no_confirmado: items.filter(
        (i) => i.tipo === "inscripto_no_confirmado"
      ).length,
      walk_in: items.filter((i) => i.tipo === "walk_in").length,
    };

    if (search) {
      items = items.filter(
        (i) =>
          (i.nombre || "").toLowerCase().includes(search) ||
          i.mail.toLowerCase().includes(search)
      );
    }

    if (
      tipoFilter === "confirmado" ||
      tipoFilter === "inscripto_no_confirmado" ||
      tipoFilter === "walk_in"
    ) {
      items = items.filter((i) => i.tipo === tipoFilter);
    }

    return NextResponse.json({ items, counts });
  } catch (error) {
    console.error("Error GET /api/admin/asistentes:", error);
    return NextResponse.json(
      { error: "Error al listar asistentes" },
      { status: 500 }
    );
  }
}
