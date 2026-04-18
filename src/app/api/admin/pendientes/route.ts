import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

const PENDIENTES_COLLECTION = "pendientes_acreditacion_1";
const ASISTENTES_COLLECTION = "asistentes_encuentro_1";

type EstadoPendiente = "pending" | "approved" | "rejected";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const estado = (searchParams.get("estado") || "pending") as EstadoPendiente | "all";
    const search = searchParams.get("search")?.trim().toLowerCase() || "";

    const db = await getDb();
    const filter: Record<string, unknown> = {};
    if (estado !== "all") filter.estado = estado;

    const docs = await db
      .collection(PENDIENTES_COLLECTION)
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    let items = docs.map((d) => ({
      id: String(d._id),
      nombre: d.nombre || "",
      mail: d.mail || "",
      edad: d.edad ?? null,
      telefono: d.telefono || "",
      telefonoNorm: d.telefonoNorm || "",
      estado: (d.estado || "pending") as EstadoPendiente,
      createdAt: d.createdAt || null,
      resolvedAt: d.resolvedAt || null,
    }));

    if (search) {
      items = items.filter(
        (i) =>
          i.nombre.toLowerCase().includes(search) ||
          i.mail.toLowerCase().includes(search) ||
          i.telefono.includes(search)
      );
    }

    // Counts sin filtro para stats
    const allDocs = await db.collection(PENDIENTES_COLLECTION).find({}).toArray();
    const counts = {
      total: allDocs.length,
      pending: allDocs.filter((d) => (d.estado || "pending") === "pending").length,
      approved: allDocs.filter((d) => d.estado === "approved").length,
      rejected: allDocs.filter((d) => d.estado === "rejected").length,
    };

    return NextResponse.json({ items, counts });
  } catch (error) {
    console.error("Error GET /api/admin/pendientes:", error);
    return NextResponse.json(
      { error: "Error al listar pendientes" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, accion } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "id requerido" }, { status: 400 });
    }
    if (accion !== "approve" && accion !== "reject" && accion !== "pending") {
      return NextResponse.json(
        { error: "acción inválida (approve | reject | pending)" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const pendientes = db.collection(PENDIENTES_COLLECTION);

    let _id: ObjectId;
    try {
      _id = new ObjectId(id);
    } catch {
      return NextResponse.json({ error: "id inválido" }, { status: 400 });
    }

    const doc = await pendientes.findOne({ _id });
    if (!doc) {
      return NextResponse.json({ error: "Pendiente no encontrado" }, { status: 404 });
    }

    const nuevoEstado: EstadoPendiente =
      accion === "approve" ? "approved" : accion === "reject" ? "rejected" : "pending";

    await pendientes.updateOne(
      { _id },
      {
        $set: {
          estado: nuevoEstado,
          resolvedAt: nuevoEstado === "pending" ? null : new Date(),
        },
      }
    );

    // Si aprobamos, insertar en asistentes_encuentro_1 como walk_in
    if (nuevoEstado === "approved") {
      const mail = (doc.mail || "").toLowerCase();
      const asistentes = db.collection(ASISTENTES_COLLECTION);

      const dupCheck = mail
        ? await asistentes.findOne({ mail })
        : null;

      if (!dupCheck) {
        await asistentes.insertOne({
          mail,
          nombre: doc.nombre || "",
          telefono: doc.telefono || "",
          tipo: "walk_in",
          inscripto: false,
          confirmado: false,
          encuentro: "e1",
          createdAt: new Date(),
          pendienteId: String(_id),
        });
      }
    }

    return NextResponse.json({ success: true, estado: nuevoEstado });
  } catch (error) {
    console.error("Error PATCH /api/admin/pendientes:", error);
    return NextResponse.json(
      { error: "Error al actualizar el pendiente" },
      { status: 500 }
    );
  }
}
