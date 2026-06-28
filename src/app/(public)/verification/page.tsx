"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { StatusBadge } from "@/components/StatusBadge";
import { formatFCFA, formatShortDate } from "@/lib/format";
import { Search, Loader2, FileSearch, ArrowRight, ShieldCheck } from "lucide-react";

interface ResultItem {
  reference: string;
  kind: "subscription" | "passage";
  plate: string;
  status: string;
  amount: number;
  vehicleType: string;
  summary: string;
  createdAt: string;
  travelDate?: string;
}

export default function VerificationPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    subscriptions: ResultItem[];
    passages: ResultItem[];
  } | null>(null);
  const [searched, setSearched] = useState(false);

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (q.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/lookup?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults({ subscriptions: [], passages: [] });
    } finally {
      setLoading(false);
    }
  }

  const all = results
    ? [...results.subscriptions, ...results.passages].sort(
        (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
      )
    : [];

  return (
    <>
      <PageHero
        eyebrow="Contrôle & transparence"
        title="Vérifier un paiement"
        subtitle="Retrouvez l’état d’un trajet ou d’un passage à partir de sa référence ou de la plaque d’immatriculation."
        icon={ShieldCheck}
      />

      <div className="mx-auto max-w-3xl px-6 py-12">
        <form onSubmit={search} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
            />
            <input
              className="input-field !pl-10"
              placeholder="Référence (PRE-… / INS-…) ou plaque (AB-123-CD)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-brand flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold sm:w-auto"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin-slow" />
            ) : (
              <Search size={16} />
            )}
            Rechercher
          </button>
        </form>

        <div className="mt-8">
          {loading && (
            <div className="card flex flex-col items-center gap-3 py-16 text-ink-soft">
              <Loader2 size={28} className="animate-spin-slow text-brand" />
              Recherche en cours…
            </div>
          )}

          {!loading && searched && all.length === 0 && (
            <div className="card flex flex-col items-center gap-3 py-16 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand">
                <FileSearch size={26} />
              </span>
              <p className="font-display text-lg font-bold text-ink">
                Aucun résultat trouvé
              </p>
              <p className="max-w-sm text-sm text-ink-soft">
                Vérifiez la référence ou la plaque saisie. Seuls les paiements
                enregistrés apparaissent ici.
              </p>
            </div>
          )}

          {!loading && all.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-ink-soft">
                {all.length} résultat{all.length > 1 ? "s" : ""} trouvé
                {all.length > 1 ? "s" : ""}
              </p>
              {all.map((item) => (
                <div
                  key={item.reference}
                  className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                        item.kind === "subscription"
                          ? "bg-brand-soft text-brand"
                          : "bg-leaf/10 text-leaf"
                      }`}
                    >
                      {item.kind === "subscription" ? "🗺" : "⚡"}
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-bold text-ink">
                        {item.reference}
                      </p>
                      <p className="truncate text-sm text-ink-soft">
                        {item.summary} · {item.plate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-display text-base font-bold text-ink">
                        {formatFCFA(item.amount)}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {item.kind === "subscription"
                          ? item.travelDate
                            ? formatShortDate(item.travelDate)
                            : formatShortDate(item.createdAt)
                          : formatShortDate(item.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                    <Link
                      href={`/confirmation/${item.reference}`}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-brand/15 text-brand transition-colors hover:bg-brand hover:text-white"
                      aria-label="Voir le reçu"
                    >
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searched && !loading && (
            <div className="card flex flex-col items-center gap-3 py-16 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand">
                <Search size={26} />
              </span>
              <p className="font-display text-lg font-bold text-ink">
                Entrez une référence ou une plaque
              </p>
              <p className="max-w-sm text-sm text-ink-soft">
                Consultez instantanément le statut de n’importe quel paiement
                effectué sur la plateforme.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
