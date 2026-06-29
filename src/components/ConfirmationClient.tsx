"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { QrCode } from "@/components/QrCode";
import { OfficialTicket } from "@/components/OfficialTicket";
import { StatusBadge } from "@/components/StatusBadge";
import { formatFCFA, formatDateTime } from "@/lib/format";
import { vehicleName, PAYMENT_METHODS } from "@/lib/constants";
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Printer,
  ArrowRight,
  ReceiptText,
  AlertCircle,
  Home,
} from "lucide-react";

export interface ReceiptData {
  reference: string;
  kind: "subscription" | "passage";
  fullName: string;
  phone: string;
  email: string | null;
  plate: string;
  vehicleType: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  createdAt: string;
  paidAt: string | null;
  details: Record<string, string>;
}

declare global {
  interface Window {
    openKkiapayWidget?: (config: Record<string, unknown>) => void;
    addSuccessListener?: (cb: (response: { transactionId: string }) => void) => void;
    addFailedListener?: (cb: (response: unknown) => void) => void;
  }
}

export function ConfirmationClient({ data }: { data: ReceiptData }) {
  const isPaid = data.status === "paid" || data.status === "used";
  if (isPaid) return <Receipt data={data} />;
  return <Payment data={data} />;
}

/* ----------------- PAYMENT (widget Kkiapay) ----------------- */
function Payment({ data }: { data: ReceiptData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [config, setConfig] = useState<{ publicKey: string; sandbox: boolean } | null>(null);
  const [widgetReady, setWidgetReady] = useState(false);

  useEffect(() => {
    fetch("/api/payment/config")
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setError("Impossible de charger la configuration de paiement."));
  }, []);

  useEffect(() => {
    if (!widgetReady || typeof window === "undefined" || !window.addSuccessListener) return;

    window.addSuccessListener(async (response) => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: data.reference,
            transactionId: response.transactionId,
            paymentMethod: "kkiapay",
          }),
        });
        const result = await res.json();
        if (result.success) {
          router.refresh();
        } else {
          setError(result.message ?? "Le paiement n'a pas pu être confirmé.");
        }
      } catch {
        setError("Paiement reçu, mais la confirmation a échoué. Contactez le support si besoin.");
      } finally {
        setLoading(false);
      }
    });

    window.addFailedListener?.(() => {
      setError("Le paiement a été annulé ou a échoué.");
    });
  }, [widgetReady, data.reference, router]);

  function openWidget() {
    if (!config?.publicKey) {
      setError("Configuration de paiement indisponible. Réessayez plus tard.");
      return;
    }
    setError("");
    window.openKkiapayWidget?.({
      amount: data.amount,
      key: config.publicKey,
      sandbox: config.sandbox,
      position: "center",
      phone: data.phone,
      data: JSON.stringify({ reference: data.reference }),
    });
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-12">
      <Script
        src="https://cdn.kkiapay.me/k.js"
        onLoad={() => setWidgetReady(true)}
      />
      <div className="card overflow-hidden">
        <div className="brand-gradient px-6 py-5 text-white">
          <p className="text-xs uppercase tracking-wide text-white/70">
            Référence {data.reference}
          </p>
          <div className="mt-1 flex items-end justify-between">
            <p className="font-display text-2xl font-bold">
              {formatFCFA(data.amount)}
            </p>
            <StatusBadge status={data.status} />
          </div>
        </div>

        <div className="p-6">
          <h2 className="font-display text-lg font-bold text-ink">
            Finaliser le paiement
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {data.kind === "subscription"
              ? "Abonnement trajet — paiement à l’avance"
              : "Passage instantané — paiement sur la plateforme"}
          </p>
          <p className="mt-4 text-sm text-ink-soft">
            Vous serez redirigé vers une fenêtre sécurisée Kkiapay pour régler
            en Mobile Money (MTN, Moov, Celtiis) ou par carte bancaire.
          </p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <button
            onClick={openWidget}
            disabled={loading || !widgetReady || !config?.publicKey}
            className="btn-brand mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin-slow" /> Vérification du paiement…
              </>
            ) : !widgetReady ? (
              <>
                <Loader2 size={18} className="animate-spin-slow" /> Chargement…
              </>
            ) : (
              <>
                Payer {formatFCFA(data.amount)} <ArrowRight size={18} />
              </>
            )}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-ink-soft">
            <ShieldCheck size={13} className="text-leaf" /> Paiement sécurisé via Kkiapay
          </p>
        </div>
      </div>
    </div>
  );
}

/* ----------------- RECEIPT ----------------- */
function Receipt({ data }: { data: ReceiptData }) {
  const pm = PAYMENT_METHODS.find((p) => p.id === data.paymentMethod);
  const paymentLabel = pm
    ? `${pm.emoji} ${pm.name}`
    : data.paymentMethod
      ? "💳 Kkiapay (Mobile Money / Carte)"
      : "—";
  return (
    <div className="mx-auto max-w-xl px-6 py-12 print:py-0">
      <div className="animate-fade-up card overflow-hidden print:shadow-none">
        {/* header */}
        <div className="relative brand-gradient px-6 py-6 text-center text-white">
          <div className="absolute right-4 top-4">
            <StatusBadge status={data.status} />
          </div>
          <span className="mx-auto grid h-14 w-14 animate-fade-up place-items-center rounded-full bg-white/15 ring-4 ring-white/20">
            <CheckCircle2 size={30} className="text-white" />
          </span>
          <h1 className="mt-3 font-display text-2xl font-extrabold">
            Paiement confirmé
          </h1>
          <p className="text-sm text-white/80">
            {data.kind === "subscription"
              ? "Abonnement trajet validé"
              : "Passage instantané validé"}
          </p>
        </div>

        {/* QR */}
        <div className="flex flex-col items-center gap-3 border-b border-dashed border-brand/20 bg-brand-soft/20 px-6 py-6">
          <div className="rounded-2xl bg-white p-3 shadow-[0_10px_30px_-12px_rgba(120,0,0,0.4)] ring-1 ring-brand/10">
            <QrCode value={data.reference} size={150} />
          </div>
          <p className="text-center text-xs text-ink-soft">
            Présentez ce code au contrôle de péage
          </p>
          <p className="font-mono text-sm font-bold tracking-wider text-ink">
            {data.reference}
          </p>
        </div>

        {/* details */}
        <div className="px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <Info label="Bénéficiaire" value={data.fullName} />
            <Info label="Téléphone" value={data.phone} />
            <Info label="Plaque" value={data.plate} />
            <Info label="Véhicule" value={vehicleName(data.vehicleType)} />
          </div>

          <div className="my-5 h-px bg-brand/10" />

          <dl className="space-y-2.5">
            {Object.entries(data.details).map(([k, v]) => (
              <div
                key={k}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <dt className="text-ink-soft">{k}</dt>
                <dd className="text-right font-semibold text-ink">{v}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="text-ink-soft">Moyen de paiement</dt>
              <dd className="font-semibold text-ink">
                {paymentLabel}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <dt className="text-ink-soft">Date</dt>
              <dd className="font-semibold text-ink">
                {data.paidAt ? formatDateTime(data.paidAt) : formatDateTime(data.createdAt)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 flex items-center justify-between rounded-2xl bg-brand-soft/40 px-5 py-4">
            <span className="text-sm font-semibold text-ink-soft">
              Montant payé
            </span>
            <span className="font-display text-2xl font-extrabold text-brand">
              {formatFCFA(data.amount)}
            </span>
          </div>
        </div>

        {/* footer */}
        <div className="px-6 pb-6">
          <div className="flex h-1.5 w-full overflow-hidden rounded-full">
            <span className="flex-1 bg-leaf" />
            <span className="flex-1 bg-gold" />
            <span className="flex-1 bg-brand" />
          </div>
          <p className="mt-3 text-center text-xs text-ink-soft">
            Merci de votre confiance · Péage Bénin — République du Bénin
          </p>
        </div>
      </div>

      {/* actions */}
      <div className="mt-5 flex flex-col gap-3 print:hidden sm:flex-row">
        <button
          onClick={() => window.print()}
          className="btn-brand flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold"
        >
          <Printer size={16} /> Imprimer / PDF
        </button>
        <Link
          href="/verification"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand/15 bg-white px-4 py-3 text-sm font-bold text-ink transition-colors hover:bg-brand-soft/40"
        >
          <ReceiptText size={16} /> Vérifier un autre paiement
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-xl border border-brand/15 bg-white px-4 py-3 text-sm font-bold text-ink transition-colors hover:bg-brand-soft/40"
        >
          <Home size={16} />
        </Link>
      </div>

      <div className="print:hidden">
        <OfficialTicket data={data} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
