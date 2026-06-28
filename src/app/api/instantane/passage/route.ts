import {
  createPassage,
  isValidPhone,
  isValidPlate,
} from "@/lib/services";
import { STATIONS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const fullName = String(body.fullName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const plate = String(body.plate ?? "").trim();
    const station = String(body.station ?? "");
    const direction = String(body.direction ?? "");
    const vehicleType = String(body.vehicleType ?? "car");

    if (!fullName) return json(false, "Veuillez indiquer votre nom complet.");
    if (!isValidPhone(phone))
      return json(false, "Numéro de téléphone invalide (ex. : 01 97 00 00 00).");
    if (!isValidPlate(plate))
      return json(false, "Plaque d'immatriculation invalide.");
    if (!STATIONS.find((s) => s.id === station))
      return json(false, "Poste de péage invalide.");
    if (!direction) return json(false, "Veuillez choisir le sens de passage.");
    if (vehicleType === "moto")
      return json(false, "Les motos ne sont pas prises en charge sur ce réseau.");

    const { row } = await createPassage({
      fullName,
      phone,
      plate,
      station,
      direction,
      vehicleType,
    });

    return Response.json({
      success: true,
      message: "Passage enregistré. Procédez au paiement.",
      reference: row.reference,
      amount: row.amount,
    });
  } catch (err) {
    console.error(err);
    return json(false, "Une erreur est survenue. Veuillez réessayer.");
  }
}

function json(success: boolean, message: string, status = 400) {
  return Response.json({ success, message }, { status });
}
