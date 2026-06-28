import { processPayment } from "@/lib/services";
import { PAYMENT_METHODS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reference = String(body.reference ?? "").trim();
    const paymentMethod = String(body.paymentMethod ?? "").trim();

    if (!reference)
      return Response.json({ success: false, message: "Référence manquante." }, { status: 400 });
    if (!PAYMENT_METHODS.find((p) => p.id === paymentMethod))
      return Response.json({ success: false, message: "Moyen de paiement invalide." }, { status: 400 });

    const result = await processPayment(reference, paymentMethod);
    return Response.json(result, { status: result.success ? 200 : 400 });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false, message: "Une erreur est survenue." }, { status: 500 });
  }
}
