import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { sendConfirmacionAsistencia } from "@/lib/send-email";

const CONFIRMACIONES_COLLECTION = "confirmaciones_encuentro_1";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase();
    const filter = searchParams.get("filter"); // "all" | "confirmed" | "unconfirmed"

    const db = await getDb();
    const encuestas = await db
      .collection("encuestas")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    const confirmaciones = await db
      .collection(CONFIRMACIONES_COLLECTION)
      .find({})
      .toArray();

    const confirmMap = new Map(
      confirmaciones.map((c) => [String(c.mail).toLowerCase(), c])
    );

    let items = encuestas.map((e) => {
      const mail = String(e.personal?.mail || "").toLowerCase();
      const conf = confirmMap.get(mail);
      return {
        id: String(e._id),
        mail,
        nombre: e.personal?.nombre || "",
        telefono: e.personal?.telefono || "",
        edad: e.personal?.edad || null,
        localidad: e.personal?.localidad || "",
        createdAt: e.createdAt || null,
        confirmado: !!conf?.confirmado,
        confirmadoAt: conf?.confirmadoAt || null,
      };
    });

    const totalInscriptos = encuestas.length;
    const totalConfirmados = items.filter((i) => i.confirmado).length;

    if (search) {
      items = items.filter(
        (i) =>
          i.nombre.toLowerCase().includes(search) ||
          i.mail.toLowerCase().includes(search) ||
          i.localidad.toLowerCase().includes(search)
      );
    }
    if (filter === "confirmed") items = items.filter((i) => i.confirmado);
    if (filter === "unconfirmed") items = items.filter((i) => !i.confirmado);

    return NextResponse.json({
      items,
      stats: {
        totalInscriptos,
        totalConfirmados,
      },
    });
  } catch (error) {
    console.error("Error fetching confirmaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener confirmaciones" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { mail, confirmado } = await req.json();
    if (!mail || typeof mail !== "string") {
      return NextResponse.json({ error: "mail requerido" }, { status: 400 });
    }

    const mailLower = mail.trim().toLowerCase();
    const db = await getDb();

    await db.collection(CONFIRMACIONES_COLLECTION).updateOne(
      { mail: mailLower },
      {
        $set: {
          mail: mailLower,
          confirmado: !!confirmado,
          confirmadoAt: confirmado ? new Date() : null,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    // Disparar email de confirmación solo al pasar a confirmado=true.
    // El helper tiene dedup propio: si ya se envió antes, no reenvía.
    if (confirmado) {
      try {
        const encuesta = await db
          .collection("encuestas")
          .findOne({ "personal.mail": mailLower });
        const nombre = encuesta?.personal?.nombre || "";
        await sendConfirmacionAsistencia({ mail: mailLower, nombre });
      } catch (err) {
        console.error("Error enviando email de confirmación:", err);
        // No bloqueamos la respuesta: el toggle ya quedó persistido.
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating confirmacion:", error);
    return NextResponse.json(
      { error: "Error al actualizar confirmación" },
      { status: 500 }
    );
  }
}
