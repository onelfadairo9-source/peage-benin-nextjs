import { calculatePrice } from "@/lib/pricing";
import { cityName } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { from, to, vehicleType } = await req.json();
    if (!from || !to) {
      return Response.json(
        { success: false, message: "Villes manquantes." },
        { status: 400 },
      );
    }
    const quote = calculatePrice(from, to, vehicleType || "car");
    return Response.json({
      success: true,
      from,
      to,
      fromName: cityName(from),
      toName: cityName(to),
      ...quote,
    });
  } catch {
    return Response.json(
      { success: false, message: "Requête invalide." },
      { status: 400 },
    );
  }
}
