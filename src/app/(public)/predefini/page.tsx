"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BeninMap } from "@/components/BeninMap";
import { PageHero } from "@/components/PageHero";
import { CITIES, VEHICLE_TYPES, cityName } from "@/lib/constants";
import { calculatePrice } from "@/lib/pricing";
import { formatFCFA } from "@/lib/format";
import {
  CalendarClock,
  MapPin,
  ArrowLeftRight,
  Route,
  Car,
  Loader2,
  ShieldCheck,
  Info,
} from "lucide-react";

export default function PredefiniPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    plate: "",
    depart: "cotonou",
    arrivee: "parakou",
    travelDate: "",
    vehicleType: "car",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const swap = () =>
    setForm((f) => ({ ...f, depart: f.arrivee, arrivee: f.depart }));

  const quote = calculatePrice(form.depart, form.arrivee, form.vehicleType);
  const sameCity = form.depart === form.arrivee;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/predefini/subscribe", {
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
        eyebrow="Paiement à l’avance"
        title="Mode Prédéfini"
        subtitle="Programmez votre trajet entre deux villes, payez en ligne et franchissez les postes de péage sans vous arrêter."
        icon={CalendarClock}
      />

      <div className="mx-auto max-w-7xl px-6 py-12">
        <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* FORM */}
          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-ink">
              Détails du trajet
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Renseignez vos informations pour obtenir votre tarif.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
              <Field label="Email (optionnel)">
                <input
                  className="input-field"
                  type="email"
                  placeholder="vous@email.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </Field>
            </div>

            {/* Itinéraire */}
            <div className="mt-6 rounded-2xl border border-brand/10 bg-brand-soft/30 p-4">
              <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
                <Field label="Ville de départ">
                  <select
                    className="input-field"
                    value={form.depart}
                    onChange={(e) => set("depart", e.target.value)}
                  >
                    {CITIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <button
                  type="button"
                  onClick={swap}
                  className="mb-1 grid h-10 w-10 place-items-center self-center justify-self-center rounded-xl border border-brand/20 bg-white text-brand transition-colors hover:bg-brand hover:text-white"
                  aria-label="Inverser le trajet"
                >
                  <ArrowLeftRight size={16} />
                </button>
                <Field label="Ville d’arrivée">
                  <select
                    className="input-field"
                    value={form.arrivee}
                    onChange={(e) => set("arrivee", e.target.value)}
                  >
                    {CITIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              {sameCity && (
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand">
                  <Info size={13} /> Les villes doivent être différentes.
                </p>
              )}
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Date prévue de passage" required>
                <input
                  className="input-field"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={form.travelDate}
                  onChange={(e) => set("travelDate", e.target.value)}
                  required
                />
              </Field>
            </div>

            {/* Vehicle type */}
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-ink">
                Type de véhicule
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {VEHICLE_TYPES.map((v) => {
                  const active = form.vehicleType === v.id;
                  return (
                    <button
                      type="button"
                      key={v.id}
                      onClick={() => set("vehicleType", v.id)}
                      className={`rounded-2xl border p-4 text-left transition-all ${
                        active
                          ? "border-brand bg-brand-soft/50 ring-2 ring-brand/30"
                          : "border-brand/10 bg-white hover:border-brand/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{v.icon}</span>
                        {active && (
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-white">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-bold text-ink">{v.name}</p>
                      <p className="text-xs text-ink-soft">{v.rate} F/porte</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="card overflow-hidden">
              <div className="brand-gradient px-5 py-4 text-white">
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Récapitulatif
                </p>
                <p className="font-display text-lg font-bold">
                  {cityName(form.depart)} → {cityName(form.arrivee)}
                </p>
              </div>

              <div className="rounded-b-xl bg-brand-soft/20 p-3">
                <BeninMap
                  from={form.depart}
                  to={form.arrivee}
                  className="mx-auto max-h-[220px]"
                />
              </div>

              <div className="space-y-2.5 p-5">
                <Row icon={Route} label="Distance">
                  {quote.distance} km
                </Row>
                <Row icon={MapPin} label="Portes franchies">
                  {quote.gates} × {formatFCFA(quote.rate)}
                </Row>
                <Row icon={Car} label="Véhicule">
                  {VEHICLE_TYPES.find((v) => v.id === form.vehicleType)?.name}
                </Row>
                {form.travelDate && (
                  <Row icon={CalendarClock} label="Date">
                    {new Date(form.travelDate).toLocaleDateString("fr-FR")}
                  </Row>
                )}

                <div className="!mt-4 flex items-end justify-between border-t border-brand/10 pt-4">
                  <span className="text-sm font-semibold text-ink-soft">
                    Total à payer
                  </span>
                  <span className="font-display text-3xl font-extrabold text-brand">
                    {formatFCFA(quote.amount)}
                  </span>
                </div>

                {error && (
                  <div className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || sameCity}
                  className="btn-brand mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin-slow" /> Traitement…
                    </>
                  ) : (
                    <>Valider et payer</>
                  )}
                </button>
                <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-xs text-ink-soft">
                  <ShieldCheck size={13} className="text-leaf" /> Paiement
                  sécurisé · aucune somme n’est débitée avant validation
                </p>
              </div>
            </div>

            <Link
              href="/instantane"
              className="mt-4 block rounded-xl border border-brand/15 bg-white px-4 py-3 text-center text-sm font-semibold text-brand-dark transition-colors hover:bg-brand-soft/40"
            >
              ⚡ Vous préférez payer au passage ? Mode Instantané →
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
  icon: typeof Route;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="inline-flex items-center gap-2 text-ink-soft">
        <Icon size={15} className="text-brand" /> {label}
      </span>
      <span className="font-semibold text-ink">{children}</span>
    </div>
  );
}
