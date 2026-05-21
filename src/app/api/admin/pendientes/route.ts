import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { ENCUENTROS, colName, type EncuentroId } from "@/lib/encuentro-config";

const DEFAULT_ENCUENTRO: EncuentroId = "e1";

function resolveEncuentroId(raw: string | null): EncuentroId {
  if (raw && raw in ENCUENTROS) return raw as EncuentroId;
  return DEFAULT_ENCUENTRO;
}

type EstadoPendiente = "pending" | "approved" | "rejected";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const estado = (searchParams.get("estado") || "pending") as EstadoPendiente | "all";
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const encuentroId = resolveEncuentroId(searchParams.get("encuentroId"));
    const pendientesCol = colName("pendientes_acreditacion", encuentroId);

    const db = await getDb();
    const filter: Record<string, unknown> = {};
    if (estado !== "all") filter.estado = estado;

    const docs = await db
      .collection(pendientesCol)
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
      inscripto: !!d.inscripto,
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
    const allDocs = await db.collection(pendientesCol).find({}).toArray();
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
    const body = await req.json();
    const { id, accion } = body;
    const encuentroId = resolveEncuentroId(body.encuentroId);
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
    const pendientes = db.collection(
      colName("pendientes_acreditacion", encuentroId),
    );

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

    // Si aprobamos: PRIMERO insertar en asistentes (si falla, el pendiente
    // se queda en pending y el equipo puede reintentar). Solo después del
    // insert exitoso actualizamos el estado del pendiente.
    if (nuevoEstado === "approved") {
      const mail = (doc.mail || "").toLowerCase();
      const asistentes = db.collection(colName("asistentes", encuentroId));

      const dupCheck = mail ? await asistentes.findOne({ mail }) : null;

      if (!dupCheck) {
        const inscriptoFlag = !!doc.inscripto;
        const tipo = inscriptoFlag ? "inscripto_no_confirmado" : "walk_in";
        await asistentes.insertOne({
          mail,
          nombre: doc.nombre || "",
          telefono: doc.telefono || "",
          tipo,
          inscripto: inscriptoFlag,
          confirmado: false,
          encuentro: encuentroId,
          createdAt: new Date(),
          pendienteId: String(_id),
        });
      }
    }

    await pendientes.updateOne(
      { _id },
      {
        $set: {
          estado: nuevoEstado,
          resolvedAt: nuevoEstado === "pending" ? null : new Date(),
        },
      }
    );

    return NextResponse.json({ success: true, estado: nuevoEstado });
  } catch (error) {
    console.error("Error PATCH /api/admin/pendientes:", error);
    return NextResponse.json(
      { error: "Error al actualizar el pendiente" },
      { status: 500 }
    );
  }
}
