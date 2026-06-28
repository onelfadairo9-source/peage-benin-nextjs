import {
  createSubscription,
  isValidPhone,
  isValidPlate,
} from "@/lib/services";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const fullName = String(body.fullName ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const email = body.email ? String(body.email).trim() : "";
    const plate = String(body.plate ?? "").trim();
    const depart = String(body.depart ?? "");
    const arrivee = String(body.arrivee ?? "");
    const travelDate = String(body.travelDate ?? "");
    const vehicleType = String(body.vehicleType ?? "car");

    if (!fullName) return json(false, "Veuillez indiquer votre nom complet.");
    if (!isValidPhone(phone))
      return json(false, "Numéro de téléphone invalide (ex. : 01 97 00 00 00).");
    if (!isValidPlate(plate))
      return json(false, "Plaque d'immatriculation invalide.");
    if (!depart || !arrivee)
      return json(false, "Veuillez sélectionner les villes de départ et d'arrivée.");
    if (depart === arrivee)
      return json(false, "Les villes de départ et d'arrivée doivent être différentes.");
    if (!travelDate) return json(false, "Veuillez choisir une date de passage.");
    if (vehicleType === "moto")
      return json(false, "Les motos ne sont pas autorisées à s'abonner.");
    if (new Date(travelDate) < new Date(new Date().toDateString()))
      return json(false, "La date de passage ne peut pas être dans le passé.");

    const { row, quote } = await createSubscription({
      fullName,
      phone,
      email: email || undefined,
      plate,
      depart,
      arrivee,
      travelDate,
      vehicleType,
    });

    return Response.json({
      success: true,
      message: "Trajet programmé. Procédez au paiement.",
      reference: row.reference,
      amount: row.amount,
      quote,
    });
  } catch (err) {
    console.error(err);
    return json(false, "Une erreur est survenue. Veuillez réessayer.");
  }
}

function json(success: boolean, message: string, status = 400) {
  return Response.json({ success, message }, { status });
}
