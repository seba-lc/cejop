import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { normalizePhone } from "@/lib/phone";

const ASISTENTES_COLLECTION = "asistentes_encuentro_1";
const CONFIRMACIONES_COLLECTION = "confirmaciones_encuentro_1";
const PENDIENTES_COLLECTION = "pendientes_acreditacion_1";

type AsistenteTipo = "confirmado" | "inscripto_no_confirmado" | "walk_in";

// GET /api/acreditacion?telefono=... | ?mail=...
// Busca el lead en encuestas. Si encuentra, devuelve su perfil y
// estado (inscripto/confirmado/ya acreditado). Si no, devuelve
// found: false para que el front pida los datos y mande POST walk_in.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mailRaw = searchParams.get("mail")?.trim().toLowerCase();
    const telefonoRaw = searchParams.get("telefono")?.trim();
    const telefonoNorm = normalizePhone(telefonoRaw);

    if (!mailRaw && !telefonoNorm) {
      return NextResponse.json(
        { error: "Email o teléfono requerido" },
        { status: 400 }
      );
    }
    if (mailRaw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mailRaw)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }
    if (telefonoNorm && telefonoNorm.length < 8) {
      return NextResponse.json(
        { error: "Teléfono inválido, ingresá al menos 8 dígitos" },
        { status: 400 }
      );
    }

    const db = await getDb();

    // --- Buscar encuesta por mail o por los últimos 10 dígitos de teléfono
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let encuesta: any = null;
    if (mailRaw) {
      encuesta = await db
        .collection("encuestas")
        .findOne({ "personal.mail": mailRaw });
    }
    if (!encuesta && telefonoNorm) {
      // Regex: el teléfono en encuestas puede tener cualquier prefijo;
      // matcheamos contra los últimos 10 dígitos ignorando separadores.
      // Como Mongo no permite regex dinámico sobre un campo string con
      // separadores, filtramos en memoria.
      const todas = await db
        .collection("encuestas")
        .find({}, { projection: { personal: 1 } })
        .toArray();
      encuesta =
        todas.find(
          (e) => normalizePhone(e.personal?.telefono) === telefonoNorm
        ) || null;
    }

    const mail = (encuesta?.personal?.mail || mailRaw || "").toLowerCase();
    const confirmacion = mail
      ? await db.collection(CONFIRMACIONES_COLLECTION).findOne({ mail })
      : null;

    const existingAsistencia = mail
      ? await db.collection(ASISTENTES_COLLECTION).findOne({ mail })
      : null;

    const inscripto = !!encuesta;
    const confirmado = !!confirmacion?.confirmado;
    const yaAcreditado = !!existingAsistencia;

    if (!inscripto) {
      return NextResponse.json({
        found: false,
        telefono: telefonoNorm || "",
        mail: mailRaw || "",
      });
    }

    let tipo: AsistenteTipo;
    if (inscripto && confirmado) tipo = "confirmado";
    else if (inscripto) tipo = "inscripto_no_confirmado";
    else tipo = "walk_in";

    return NextResponse.json({
      found: true,
      mail,
      inscripto,
      confirmado,
      yaAcreditado,
      tipo,
      nombre: encuesta?.personal?.nombre || "",
      telefono: encuesta?.personal?.telefono || "",
    });
  } catch (error) {
    console.error("Error en GET /api/acreditacion:", error);
    return NextResponse.json(
      { error: "Error al buscar el usuario" },
      { status: 500 }
    );
  }
}

// POST /api/acreditacion
// Body:
//   - Si el usuario está en lista: { mail }  → registra en asistentes_encuentro_1
//   - Si no está: { nombre, mail, edad, telefono }  → registra en pendientes_acreditacion_1
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const mail = typeof body.mail === "string" ? body.mail.trim().toLowerCase() : "";
    const nombre = typeof body.nombre === "string" ? body.nombre.trim() : "";
    const telefonoRaw = typeof body.telefono === "string" ? body.telefono.trim() : "";
    const telefonoNorm = normalizePhone(telefonoRaw);
    const edadNum =
      typeof body.edad === "number"
        ? body.edad
        : parseInt(String(body.edad || ""), 10) || null;

    if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const db = await getDb();

    // ¿Está en encuestas? (vía mail o teléfono)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let encuesta: any = null;
    if (mail) {
      encuesta = await db
        .collection("encuestas")
        .findOne({ "personal.mail": mail });
    }
    if (!encuesta && telefonoNorm) {
      const todas = await db
        .collection("encuestas")
        .find({}, { projection: { personal: 1 } })
        .toArray();
      encuesta =
        todas.find(
          (e) => normalizePhone(e.personal?.telefono) === telefonoNorm
        ) || null;
    }

    // ═══════ Camino A: inscripto → acredita en asistentes_encuentro_1 ═══════
    if (encuesta) {
      const leadMail = String(encuesta.personal?.mail || mail).toLowerCase();
      const confirmacion = await db
        .collection(CONFIRMACIONES_COLLECTION)
        .findOne({ mail: leadMail });
      const confirmado = !!confirmacion?.confirmado;
      const tipo: AsistenteTipo = confirmado
        ? "confirmado"
        : "inscripto_no_confirmado";

      const leadNombre = encuesta.personal?.nombre || nombre || "";
      const leadTel = encuesta.personal?.telefono || telefonoRaw || "";

      const coll = db.collection(ASISTENTES_COLLECTION);
      const existing = await coll.findOne({ mail: leadMail });

      if (existing) {
        return NextResponse.json({
          success: true,
          mode: "acreditado",
          duplicate: true,
          tipo: existing.tipo || tipo,
          nombre: existing.nombre || leadNombre,
        });
      }

      await coll.insertOne({
        mail: leadMail,
        nombre: leadNombre,
        telefono: leadTel,
        tipo,
        inscripto: true,
        confirmado,
        encuentro: "e1",
        createdAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        mode: "acreditado",
        duplicate: false,
        tipo,
        nombre: leadNombre,
      });
    }

    // ═══════ Camino B: no inscripto → guardar en pendientes ═══════
    if (!nombre) {
      return NextResponse.json(
        { error: "Nombre requerido" },
        { status: 400 }
      );
    }
    if (!telefonoNorm || telefonoNorm.length < 8) {
      return NextResponse.json(
        { error: "Teléfono requerido (al menos 8 dígitos)" },
        { status: 400 }
      );
    }

    const pendientes = db.collection(PENDIENTES_COLLECTION);
    // Dedup: si ya hay un pendiente por mismo mail o tel, no duplicar
    const existingPending = await pendientes.findOne({
      $or: [
        ...(mail ? [{ mail }] : []),
        { telefonoNorm },
      ],
    });

    if (existingPending) {
      return NextResponse.json({
        success: true,
        mode: "pendiente",
        duplicate: true,
        estado: existingPending.estado || "pending",
      });
    }

    await pendientes.insertOne({
      nombre,
      mail: mail || "",
      edad: edadNum,
      telefono: telefonoRaw,
      telefonoNorm,
      estado: "pending",
      encuentro: "e1",
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      mode: "pendiente",
      duplicate: false,
      estado: "pending",
    });
  } catch (error) {
    console.error("Error en POST /api/acreditacion:", error);
    return NextResponse.json(
      { error: "Error al registrar la acreditación" },
      { status: 500 }
    );
  }
}
