import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const ASISTENTES_COLLECTION = "asistentes_encuentro_1";
const CONFIRMACIONES_COLLECTION = "confirmaciones_encuentro_1";

type AsistenteTipo = "confirmado" | "inscripto_no_confirmado" | "walk_in";

// GET /api/acreditacion?mail=foo@bar.com
// Returns the profile of the lead (if any) so the acreditacion page can
// prefill the name and show the correct welcome message.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mail = searchParams.get("mail")?.trim().toLowerCase();
    if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const encuesta = await db
      .collection("encuestas")
      .findOne({ "personal.mail": mail });
    const confirmacion = await db
      .collection(CONFIRMACIONES_COLLECTION)
      .findOne({ mail });
    const existingAsistencia = await db
      .collection(ASISTENTES_COLLECTION)
      .findOne({ mail });

    const inscripto = !!encuesta;
    const confirmado = !!confirmacion?.confirmado;
    const yaAcreditado = !!existingAsistencia;

    let tipo: AsistenteTipo;
    if (inscripto && confirmado) tipo = "confirmado";
    else if (inscripto) tipo = "inscripto_no_confirmado";
    else tipo = "walk_in";

    return NextResponse.json({
      mail,
      inscripto,
      confirmado,
      yaAcreditado,
      tipo,
      nombre: encuesta?.personal?.nombre || existingAsistencia?.nombre || "",
      telefono:
        encuesta?.personal?.telefono || existingAsistencia?.telefono || "",
    });
  } catch (error) {
    console.error("Error en GET /api/acreditacion:", error);
    return NextResponse.json(
      { error: "Error al buscar el email" },
      { status: 500 }
    );
  }
}

// POST /api/acreditacion
// Registra la asistencia en asistentes_encuentro_1.
// Body: { mail, nombre?, telefono? }
// Para el walk_in, nombre es obligatorio.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mail = typeof body.mail === "string" ? body.mail.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    const db = await getDb();

    const encuesta = await db
      .collection("encuestas")
      .findOne({ "personal.mail": mail });
    const confirmacion = await db
      .collection(CONFIRMACIONES_COLLECTION)
      .findOne({ mail });

    const inscripto = !!encuesta;
    const confirmado = !!confirmacion?.confirmado;

    let tipo: AsistenteTipo;
    if (inscripto && confirmado) tipo = "confirmado";
    else if (inscripto) tipo = "inscripto_no_confirmado";
    else tipo = "walk_in";

    const nombre =
      typeof body.nombre === "string" && body.nombre.trim()
        ? body.nombre.trim()
        : encuesta?.personal?.nombre?.trim() || "";

    if (tipo === "walk_in" && !nombre) {
      return NextResponse.json(
        { error: "Nombre requerido para asistente no inscripto" },
        { status: 400 }
      );
    }

    const telefono =
      typeof body.telefono === "string" && body.telefono.trim()
        ? body.telefono.trim()
        : encuesta?.personal?.telefono?.trim() || "";

    const collection = db.collection(ASISTENTES_COLLECTION);
    const existing = await collection.findOne({ mail });

    if (existing) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        tipo: existing.tipo || tipo,
        nombre: existing.nombre || nombre,
      });
    }

    await collection.insertOne({
      mail,
      nombre,
      telefono,
      tipo,
      inscripto,
      confirmado,
      encuentro: "e1",
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      duplicate: false,
      tipo,
      nombre,
    });
  } catch (error) {
    console.error("Error en POST /api/acreditacion:", error);
    return NextResponse.json(
      { error: "Error al registrar la acreditación" },
      { status: 500 }
    );
  }
}
