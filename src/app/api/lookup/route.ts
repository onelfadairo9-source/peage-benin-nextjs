import { publicLookup } from "@/lib/services";
import { cityName, stationName, vehicleName } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  if (q.trim().length < 2) {
    return Response.json({ subscriptions: [], passages: [] });
  }
  const { subscriptions, passages } = await publicLookup(q);
  return Response.json({
    subscriptions: subscriptions.map((s) => ({
      reference: s.reference,
      kind: "subscription" as const,
      plate: s.plate,
      status: s.status,
      amount: s.amount,
      vehicleType: s.vehicleType,
      summary: `${cityName(s.depart)} → ${cityName(s.arrivee)}`,
      createdAt: s.createdAt,
      travelDate: s.travelDate,
    })),
    passages: passages.map((p) => ({
      reference: p.reference,
      kind: "passage" as const,
      plate: p.plate,
      status: p.status,
      amount: p.amount,
      vehicleType: p.vehicleType,
      summary: `${stationName(p.station)} — ${p.direction}`,
      createdAt: p.createdAt,
    })),
  });
}
