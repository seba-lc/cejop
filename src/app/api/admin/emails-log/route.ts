import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const SENDS_COLLECTION = "email_sends";

const CAMPAIGN_LABELS: Record<string, string> = {
  "confirmacion-encuentro-1": "Confirmación de asistencia",
  "gracias-feedback-encuentro-1": "Gracias por el feedback",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaign = searchParams.get("campaign") || "";
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search")?.trim().toLowerCase() || "";

    const db = await getDb();
    const sends = await db
      .collection(SENDS_COLLECTION)
      .find({})
      .sort({ sentAt: -1 })
      .toArray();

    let items = sends.map((s) => ({
      id: String(s._id),
      mail: s.mail,
      campaign: s.campaign,
      campaignLabel: CAMPAIGN_LABELS[s.campaign] || s.campaign,
      status: s.status as "sent" | "failed",
      resendId: s.resendId || null,
      error: s.error || null,
      sentAt: s.sentAt || null,
      nombre:
        (s.meta && typeof s.meta === "object" && "nombre" in s.meta
          ? String((s.meta as Record<string, unknown>).nombre || "")
          : "") || "",
    }));

    // Aggregate counts from all (unfiltered) for stats
    const totalSent = items.filter((i) => i.status === "sent").length;
    const totalFailed = items.filter((i) => i.status === "failed").length;
    const byCampaign: Record<string, { sent: number; failed: number; label: string }> = {};
    for (const it of items) {
      if (!byCampaign[it.campaign]) {
        byCampaign[it.campaign] = {
          sent: 0,
          failed: 0,
          label: it.campaignLabel,
        };
      }
      if (it.status === "sent") byCampaign[it.campaign].sent++;
      else if (it.status === "failed") byCampaign[it.campaign].failed++;
    }

    // Apply filters for the listed items
    if (campaign) items = items.filter((i) => i.campaign === campaign);
    if (status === "sent" || status === "failed") {
      items = items.filter((i) => i.status === status);
    }
    if (search) {
      items = items.filter(
        (i) =>
          i.mail.toLowerCase().includes(search) ||
          i.nombre.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({
      items,
      counts: {
        total: sends.length,
        sent: totalSent,
        failed: totalFailed,
        byCampaign,
      },
    });
  } catch (error) {
    console.error("Error GET /api/admin/emails-log:", error);
    return NextResponse.json(
      { error: "Error al listar emails" },
      { status: 500 }
    );
  }
}
