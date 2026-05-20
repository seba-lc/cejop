import { NextResponse } from "next/server";
import { loadDashboardData } from "@/lib/encuentro1-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await loadDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error GET /api/cande/encuentro-1/data:", error);
    return NextResponse.json(
      { error: "Error al cargar datos del encuentro 1" },
      { status: 500 }
    );
  }
}
