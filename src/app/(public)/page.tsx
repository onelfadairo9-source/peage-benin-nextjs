import Link from "next/link";
import { BeninMap } from "@/components/BeninMap";
import { STATIONS, CITIES, PAYMENT_METHODS } from "@/lib/constants";
import {
  CalendarClock,
  Zap,
  ShieldCheck,
  Map as MapIcon,
  ReceiptText,
  Clock4,
  Smartphone,
  Lock,
  Route,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Headphones,
  BarChart3,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="hero-mesh absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.25),transparent_60%)]" />
        {/* glow blobs */}
        <div className="animate-float absolute -left-16 top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="animate-float absolute right-0 top-40 h-80 w-80 rounded-full bg-brand/30 blur-3xl" style={{ animationDelay: "1.5s" }} />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-16 lg:grid-cols-2 lg:pb-32 lg:pt-24">
          <div className="animate-fade-up">
            <span className="chip border border-white/20 bg-white/10 text-white/90 backdrop-blur">
              <span className="flex h-2 w-2">
                <span className="h-2 w-2 animate-ping rounded-full bg-gold" />
                <span className="h-2 w-2 rounded-full bg-gold" />
              </span>
              Plateforme officielle · République du Bénin
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              Fluidifiez vos trajets,
              <br />
              <span className="text-gradient-gold">payez en ligne</span> en toute
              sécurité
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">
              Le réseau national de péage du Bénin vous accompagne. Programmez
              vos trajets à l’avance ou réglez directement votre passage sur la
              plateforme — sans espèces, sans attente.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/predefini"
                className="btn-brand inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base font-bold"
              >
                <CalendarClock size={20} /> Mode Prédéfini
              </Link>
              <Link
                href="/instantane"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-3.5 text-base font-bold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <Zap size={20} /> Mode Instantané
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/75">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} className="text-gold" /> Paiement 100% sécurisé
              </span>
              <span className="inline-flex items-center gap-2">
                <Smartphone size={16} className="text-gold" /> Mobile Money
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock4 size={16} className="text-gold" /> Disponible 24/7
              </span>
            </div>
          </div>

          {/* Visual */}
          <div className="animate-fade-up delay-2 relative">
            <div className="card relative overflow-hidden p-3">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="font-display text-sm font-bold text-ink">
                  Réseau de péage · Bénin
                </span>
                <span className="chip bg-brand-soft text-brand-dark">
                  <Route size={12} /> {CITIES.length} villes
                </span>
              </div>
              <div className="rounded-2xl bg-gradient-to-b from-brand-soft/40 to-white p-2">
                <BeninMap from="cotonou" to="parakou" className="mx-auto max-h-[360px]" />
              </div>
            </div>

            {/* floating stat cards */}
            <div className="animate-float absolute -left-4 bottom-10 hidden rounded-2xl bg-white p-3 shadow-[0_18px_40px_-18px_rgba(120,0,0,0.5)] ring-1 ring-brand/10 sm:block">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                  <CircleDollarSign size={20} />
                </span>
                <div>
                  <p className="text-xs text-ink-soft">Sans attente</p>
                  <p className="font-display text-sm font-bold text-ink">
                    Passage fluide
                  </p>
                </div>
              </div>
            </div>
            <div
              className="animate-float absolute -right-3 top-6 hidden rounded-2xl bg-white p-3 shadow-[0_18px_40px_-18px_rgba(120,0,0,0.5)] ring-1 ring-brand/10 sm:block"
              style={{ animationDelay: "1.2s" }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/20 text-gold-dark">
                  <ShieldCheck size={20} />
                </span>
                <div>
                  <p className="text-xs text-ink-soft">Reçu officiel</p>
                  <p className="font-display text-sm font-bold text-ink">
                    QR vérifiable
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* wave divider */}
        <div className="relative">
          <svg viewBox="0 0 1440 80" className="block w-full" preserveAspectRatio="none">
            <path d="M0 80 C 360 10 1080 10 1440 80 Z" fill="#fbf7f7" />
          </svg>
        </div>
      </section>

      {/* ============ STATS BAR ============ */}
      <section className="mx-auto -mt-2 max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Villes desservies", value: `${CITIES.length}`, icon: MapIcon },
            { label: "Postes de péage", value: `${STATIONS.length}`, icon: Route },
            { label: "Km de réseau", value: "660+", icon: BarChart3 },
            { label: "Disponibilité", value: "24/7", icon: Clock4 },
          ].map((s, i) => (
            <div
              key={s.label}
              className="card card-hover animate-fade-up flex items-center gap-3 p-4"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                <s.icon size={20} />
              </span>
              <div>
                <p className="font-display text-2xl font-extrabold leading-none text-ink">
                  {s.value}
                </p>
                <p className="text-xs text-ink-soft">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ MODES ============ */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="chip bg-brand-soft text-brand-dark">Choisissez votre mode</span>
          <h2 className="mt-4 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Deux façons simples de payer votre péage
          </h2>
          <p className="mt-3 text-ink-soft">
            Que vous planifiiez un long trajet ou que vous passiez un poste
            aujourd’hui, tout se règle en ligne.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Prédéfini */}
          <article className="card card-hover group relative overflow-hidden p-7">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/5 transition-transform group-hover:scale-150" />
            <div className="relative">
              <span className="grid h-14 w-14 place-items-center rounded-2xl brand-gradient text-white shadow-[0_12px_30px_-12px_rgba(213,0,0,0.8)]">
                <CalendarClock size={26} />
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold text-ink">
                Mode Prédéfini
              </h3>
              <p className="chip mt-1 bg-amber-100 text-amber-700">
                Paiement à l’avance
              </p>
              <p className="mt-3 text-ink-soft">
                Programmez votre trajet entre deux villes, payez en ligne et
                franchissez les postes sans vous arrêter.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {[
                  "Itinéraire calculé et tarif transparent",
                  "Choix de la date et du véhicule",
                  "Passage prioritaire sans file d’attente",
                  "Reçu et QR code de contrôle",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-ink">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-brand" />
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                href="/predefini"
                className="btn-brand mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold"
              >
                Programmer un trajet <ArrowRight size={16} />
              </Link>
            </div>
          </article>

          {/* Instantané */}
          <article className="card card-hover group relative overflow-hidden p-7">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-leaf/5 transition-transform group-hover:scale-150" />
            <div className="relative">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-leaf to-leaf-dark text-white shadow-[0_12px_30px_-12px_rgba(0,135,81,0.8)]">
                <Zap size={26} />
              </span>
              <h3 className="mt-5 font-display text-2xl font-bold text-ink">
                Mode Instantané
              </h3>
              <p className="chip mt-1 bg-emerald-100 text-emerald-700">
                Paiement sur la plateforme
              </p>
              <p className="mt-3 text-ink-soft">
                À l’approche d’un poste de péage, réglez votre passage en
                quelques secondes directement sur votre téléphone.{" "}
                <strong className="text-ink">Aucune présentation au guichet.</strong>
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                {[
                  "Sélection du poste et du sens",
                  "Paiement immédiat (Mobile Money / carte)",
                  "Reçu digital instantané pour le contrôle",
                  "Aucune espèce, aucun ticket papier",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-ink">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-leaf" />
                    {t}
                  </li>
                ))}
              </ul>
              <Link
                href="/instantane"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-leaf to-leaf-dark px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_-12px_rgba(0,135,81,0.8)] transition-transform hover:-translate-y-0.5"
              >
                Payer un passage <ArrowRight size={16} />
              </Link>
            </div>
          </article>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="chip bg-brand-soft text-brand-dark">Simple & rapide</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Comment ça marche ?
            </h2>
          </div>
          <div className="relative mt-14 grid gap-8 md:grid-cols-3">
            <div className="absolute left-0 right-0 top-7 hidden h-0.5 bg-gradient-to-r from-brand/0 via-brand/30 to-brand/0 md:block" />
            {[
              { n: "01", t: "Renseignez votre trajet", d: "Ville de départ, d’arrivée, date et plaque d’immatriculation.", icon: Route },
              { n: "02", t: "Payez en ligne", d: "Mobile Money ou carte bancaire, de façon entièrement sécurisée.", icon: Smartphone },
              { n: "03", t: "Passez sans arrêt", d: "Recevez votre QR code officiel et franchissez le péage sereinement.", icon: ReceiptText },
            ].map((s, i) => (
              <div key={s.n} className="animate-fade-up relative text-center" style={{ animationDelay: `${i * 0.12}s` }}>
                <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl brand-gradient text-white">
                  <s.icon size={24} />
                  <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-gold text-[0.7rem] font-extrabold text-ink">
                    {s.n}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-ink">{s.t}</h3>
                <p className="mt-2 text-sm text-ink-soft">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ NETWORK ============ */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="chip bg-brand-soft text-brand-dark">Notre réseau</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Un maillage national, du sud au nord
            </h2>
            <p className="mt-3 text-ink-soft">
              Nos postes de péage couvrent les principaux axes inter-États du
              Bénin, de Cotonou jusqu’aux confins du pays.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {STATIONS.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-brand/10 bg-white p-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-brand">
                    <MapIcon size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">{s.name}</p>
                    <p className="text-xs text-ink-soft">
                      {s.highway} · {s.city}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card overflow-hidden p-3">
            <div className="rounded-2xl bg-gradient-to-b from-brand-soft/40 to-white p-2">
              <BeninMap from="cotonou" to="natitingou" className="mx-auto max-h-[440px]" />
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="chip bg-brand-soft text-brand-dark">Pourquoi nous choisir</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold text-ink sm:text-4xl">
              Une expérience pensée pour l’usager
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Lock, t: "Sécurité maximale", d: "Vos données et vos paiements sont chiffrés et protégés à chaque étape." },
              { icon: Smartphone, t: "100% mobile", d: "Réglez depuis votre téléphone, où que vous soyez, à toute heure." },
              { icon: ReceiptText, t: "Reçus vérifiables", d: "Chaque transaction génère un reçu officiel avec QR code de contrôle." },
              { icon: Clock4, t: "Gain de temps", d: "Fini les files d’attente : passez en quelques secondes." },
              { icon: CircleDollarSign, t: "Tarifs transparents", d: "Le montant est calculé instantanément selon votre trajet." },
              { icon: Headphones, t: "Assistance dédiée", d: "Un service d’aide disponible pour tous vos déplacements." },
            ].map((f, i) => (
              <div key={f.t} className="card card-hover animate-fade-up p-6" style={{ animationDelay: `${i * 0.07}s` }}>
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-brand">
                  <f.icon size={22} />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-ink">{f.t}</h3>
                <p className="mt-2 text-sm text-ink-soft">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PAYMENT METHODS ============ */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <span className="chip bg-brand-soft text-brand-dark">Moyens de paiement</span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {PAYMENT_METHODS.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-[0_8px_24px_-14px_rgba(120,0,0,0.4)] ring-1 ring-brand/10"
              >
                <span
                  className="grid h-9 w-9 place-items-center rounded-xl text-base"
                  style={{ background: p.bg, color: p.color }}
                >
                  {p.emoji}
                </span>
                <span className="text-sm font-semibold text-ink">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="hero-mesh relative overflow-hidden rounded-3xl px-8 py-14 text-center">
          <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-56 w-56 rounded-full bg-leaf/20 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              Prêt à fluidifier votre trajet ?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">
              Rejoignez les usagers qui voyagent sans attente sur le réseau de
              péage du Bénin.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/predefini" className="btn-brand inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 font-bold">
                <CalendarClock size={20} /> Programmer un trajet
              </Link>
              <Link href="/instantane" className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-3.5 font-bold text-white backdrop-blur transition-colors hover:bg-white/20">
                <Zap size={20} /> Payer un passage
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
