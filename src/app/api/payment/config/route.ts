import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Expose au navigateur ce qui est nécessaire pour ouvrir le widget Kkiapay :
 * la clé PUBLIQUE uniquement (jamais la clé privée ni le secret, qui restent
 * côté serveur pour la vérification de transaction dans /api/payment/verify).
 */
export async function GET() {
  return NextResponse.json({
    publicKey: process.env.KKIAPAY_PUBLIC_KEY ?? "",
    sandbox: process.env.KKIAPAY_SANDBOX === "true",
  });
}
