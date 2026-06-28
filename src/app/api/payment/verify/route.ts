import { NextResponse } from "next/server";
import { kkiapay } from "@kkiapay-org/nodejs-sdk";
import { processVerifiedPayment, getRecordByReference } from "@/lib/services";
import { PAYMENT_METHODS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const k = kkiapay({
  privatekey: process.env.KKIAPAY_PRIVATE_KEY ?? "",
  publickey: process.env.KKIAPAY_PUBLIC_KEY ?? "",
  secretkey: process.env.KKIAPAY_SECRET ?? "",
  sandbox: process.env.KKIAPAY_SANDBOX === "true",
});

/**
 * Vérifie une transaction Kkiapay auprès des serveurs Kkiapay avant
 * d'activer le paiement. Règle d'or anti-fraude : on ne fait jamais
 * confiance à un simple "succès" renvoyé par le widget côté navigateur.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reference = String(body.reference ?? "").trim().toUpperCase();
    const transactionId = String(body.transactionId ?? "").trim();
    const paymentMethod = String(body.paymentMethod ?? "kkiapay").trim();

    if (!reference || !transactionId) {
      return NextResponse.json(
        { success: false, message: "Paramètres manquants." },
        { status: 400 },
      );
    }

    const record = await getRecordByReference(reference);
    if (!record) {
      return NextResponse.json(
        { success: false, message: "Référence introuvable." },
        { status: 404 },
      );
    }

    if (record.status === "paid" || record.status === "used") {
      return NextResponse.json({ success: true, message: "Paiement déjà confirmé." });
    }

    // Vérification réelle auprès de Kkiapay
    const verification = await k.verify(transactionId);
    const isSuccess = verification && verification.status === "SUCCESS";
    const amountPaid = verification ? Number(verification.amount) : null;

    if (!isSuccess) {
      return NextResponse.json(
        { success: false, message: "Paiement non confirmé par Kkiapay." },
        { status: 402 },
      );
    }

    // Sécurité : le montant payé doit correspondre exactement au montant attendu
    if (amountPaid !== null && amountPaid !== record.amount) {
      console.warn(
        `Montant incohérent pour ${reference}: attendu ${record.amount}, reçu ${amountPaid}`,
      );
      return NextResponse.json(
        { success: false, message: "Montant payé incohérent." },
        { status: 402 },
      );
    }

    const methodLabel =
      PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.id ?? "kkiapay";

    const result = await processVerifiedPayment(reference, methodLabel, transactionId);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err) {
    console.error("Erreur vérification Kkiapay:", err);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la vérification du paiement." },
      { status: 500 },
    );
  }
}
