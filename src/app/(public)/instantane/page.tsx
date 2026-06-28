"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { STATIONS, VEHICLE_TYPES, vehicleRate } from "@/lib/constants";
import { formatFCFA } from "@/lib/format";
import {
  Zap,
  MapPin,
  Navigation,
  Loader2,
  ShieldCheck,
  ReceiptText,
  ArrowRight,
  Smartphone,
} from "lucide-react";

export default function InstantanePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    plate: "",
    station: STATIONS[0].id,
    direction: `${STATIONS[0].tollA} → ${STATIONS[0].tollB}`,
    vehicleType: "car",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const station = STATIONS.find((s) => s.id === form.station)!;
  const amount = vehicleRate(form.vehicleType);

  const directions = [
    `${station.tollA} → ${station.tollB}`,
    `${station.tollB} → ${station.tollA}`,
  ];

  function onStationChange(id: string) {
    const s = STATIONS.find((x) => x.id === id)!;
    setForm((f) => ({
      ...f,
      station: id,
      direction: `${s.tollA} → ${s.tollB}`,
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/instantane/passage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/confirmation/${data.reference}`);
      } else {
        setError(data.message ?? "Une erreur est survenue.");
      }
    } catch {
      setError("Connexion impossible. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Paiement sur la plateforme"
        title="Mode Instantané"
        subtitle="À l’approche d’un poste de péage, réglez votre passage en quelques secondes directement sur la plateforme. Aucune présentation au guichet."
        icon={Zap}
        accent="leaf"
      />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* FORM */}
          <div className="space-y-6">
            {/* Station */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-ink">
                1 · Poste de péage
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Sélectionnez le poste où vous allez passer.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {STATIONS.map((s) => {
                  const active = form.station === s.id;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => onStationChange(s.id)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        active
                          ? "border-leaf bg-leaf/5 ring-2 ring-leaf/30"
                          : "border-brand/10 bg-white hover:border-leaf/30"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="grid h-9 w-9 place-items-center rounded-lg bg-leaf/10 text-leaf">
                          <MapPin size={16} />
                        </span>
                        {active && (
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-leaf text-white">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-bold text-ink">{s.name}</p>
                      <p className="text-xs text-ink-soft">
                        {s.highway} · {s.city}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Direction */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-ink">
                2 · Sens de passage
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Indiquez dans quel sens vous traversez le poste.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {directions.map((d) => {
                  const active = form.direction === d;
                  return (
                    <button
                      type="button"
                      key={d}
                      onClick={() => set("direction", d)}
                      className={`flex items-center gap-3 rounded-2xl border p-4 transition-all ${
                        active
                          ? "border-leaf bg-leaf/5 ring-2 ring-leaf/30"
                          : "border-brand/10 bg-white hover:border-leaf/30"
                      }`}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-leaf/10 text-leaf">
                        <Navigation size={16} />
                      </span>
                      <span className="text-sm font-semibold text-ink">{d}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Infos */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-ink">
                3 · Vos informations
              </h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Nom complet" required>
                  <input
                    className="input-field"
                    placeholder="Ex. : Koffi Adjolala"
                    value={form.fullName}
                    onChange={(e) => set("fullName", e.target.value)}
                    required
                  />
                </Field>
                <Field label="Téléphone (Mobile Money)" required>
                  <input
                    className="input-field"
                    placeholder="01 97 00 00 00"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    required
                  />
                </Field>
                <Field label="Plaque d’immatriculation" required>
                  <input
                    className="input-field uppercase"
                    placeholder="AB-123-CD"
                    value={form.plate}
                    onChange={(e) => set("plate", e.target.value.toUpperCase())}
                    required
                  />
                </Field>
                <Field label="Type de véhicule" required>
                  <select
                    className="input-field"
                    value={form.vehicleType}
                    onChange={(e) => set("vehicleType", e.target.value)}
                  >
                    {VEHICLE_TYPES.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.icon} {v.name} — {formatFCFA(v.rate)}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="card overflow-hidden">
              <div className="bg-gradient-to-br from-leaf to-leaf-dark px-5 py-4 text-white">
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Passage instantané
                </p>
                <p className="font-display text-lg font-bold">{station.name}</p>
                <p className="text-sm text-white/80">{form.direction}</p>
              </div>

              <div className="space-y-2.5 p-5">
                <Row icon={MapPin} label="Poste">
                  {station.city}
                </Row>
                <Row icon={Navigation} label="Sens">
                  {form.direction}
                </Row>
                <Row icon={ReceiptText} label="Véhicule">
                  {VEHICLE_TYPES.find((v) => v.id === form.vehicleType)?.name}
                </Row>

                <div className="!mt-4 flex items-end justify-between border-t border-brand/10 pt-4">
                  <span className="text-sm font-semibold text-ink-soft">
                    À payer
                  </span>
                  <span className="font-display text-3xl font-extrabold text-leaf-dark">
                    {formatFCFA(amount)}
                  </span>
                </div>

                {error && (
                  <div className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-leaf to-leaf-dark py-3.5 text-base font-bold text-white shadow-[0_12px_30px_-12px_rgba(0,135,81,0.8)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin-slow" /> Traitement…
                    </>
                  ) : (
                    <>
                      Payer maintenant <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-xs text-ink-soft">
                  <ShieldCheck size={13} className="text-leaf" /> Paiement Mobile
                  Money / carte · reçu immédiat
                </p>
              </div>
            </div>

            <div className="card mt-4 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Smartphone size={16} className="text-leaf" /> 100% en ligne
              </p>
              <p className="mt-1 text-xs text-ink-soft">
                Aucune espèce, aucun ticket papier. Présentez simplement votre
                reçu digital au contrôle.
              </p>
            </div>

            <Link
              href="/predefini"
              className="mt-4 block rounded-xl border border-brand/15 bg-white px-4 py-3 text-center text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-soft/40"
            >
              🗺 Programmer un trajet à l’avance ? Mode Prédéfini →
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">
        {label} {required && <span className="text-brand">*</span>}
      </span>
      {children}
    </label>
  );
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="inline-flex items-center gap-2 text-ink-soft">
        <Icon size={15} className="text-leaf" /> {label}
      </span>
      <span className="font-semibold text-ink">{children}</span>
    </div>
  );
}
