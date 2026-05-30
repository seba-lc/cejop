import { NextResponse } from "next/server";
import { getEncuentroActivo, getEncuentro } from "@/lib/encuentro-config";

// GET /api/encuentro-activo
// Endpoint público (sin auth) con la metadata del encuentro vigente.
// Lo consumen las páginas públicas (acreditación, feedback) para mostrar
// copy dinámico sin hardcodear ordinal/fecha/título.
export async function GET() {
  try {
    const id = await getEncuentroActivo();
    const encuentro = getEncuentro(id);
    return NextResponse.json({
      id: encuentro.id,
      numero: encuentro.numero,
      ordinal: encuentro.ordinal,
      fecha: encuentro.fecha,
      fechaLarga: encuentro.fechaLarga,
      titulo: encuentro.titulo,
    });
  } catch (error) {
    console.error("Error en GET /api/encuentro-activo:", error);
    return NextResponse.json(
      { error: "Error al leer el encuentro activo" },
      { status: 500 }
    );
  }
}
