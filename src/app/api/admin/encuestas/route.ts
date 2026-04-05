import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase();
    const localidad = searchParams.get("localidad")?.trim();
    const desde = searchParams.get("desde");
    const hasta = searchParams.get("hasta");

    const db = await getDb();
    const collection = db.collection("encuestas");

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (search) {
      filter.$or = [
        { "personal.nombre": { $regex: search, $options: "i" } },
        { "personal.mail": { $regex: search, $options: "i" } },
      ];
    }

    if (localidad) {
      filter["personal.localidad"] = { $regex: localidad, $options: "i" };
    }

    if (desde || hasta) {
      filter.createdAt = {};
      if (desde) filter.createdAt.$gte = new Date(desde);
      if (hasta) {
        const end = new Date(hasta);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Get encuestas
    const encuestas = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // Aggregate stats from ALL encuestas (not filtered)
    const allEncuestas = await collection.find({}).toArray();

    const totalRespuestas = allEncuestas.length;

    // Priority counts
    const priorityCounts: Record<string, number> = {};
    for (const enc of allEncuestas) {
      if (Array.isArray(enc.prioridades)) {
        for (const p of enc.prioridades) {
          priorityCounts[p] = (priorityCounts[p] || 0) + 1;
        }
      }
    }

    const topPrioridades = Object.entries(priorityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, count]) => ({ id, count }));

    // Localidad distribution
    const localidadCounts: Record<string, number> = {};
    for (const enc of allEncuestas) {
      const loc = enc.personal?.localidad?.trim() || "Sin especificar";
      localidadCounts[loc] = (localidadCounts[loc] || 0) + 1;
    }

    const localidades = Object.entries(localidadCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      encuestas,
      stats: {
        totalRespuestas,
        topPrioridades,
        localidades,
      },
      filteredCount: encuestas.length,
    });
  } catch (error) {
    console.error("Error fetching encuestas:", error);
    return NextResponse.json(
      { error: "Error al obtener encuestas" },
      { status: 500 }
    );
  }
}
