"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { StatusBadge } from "@/components/StatusBadge";
import { BarChart, Donut, HBar } from "@/components/Charts";
import {
  cityName,
  stationName,
  vehicleName,
  paymentName,
  PAYMENT_METHODS,
} from "@/lib/constants";
import { formatFCFA, formatDateTime, formatShortDate } from "@/lib/format";
import {
  LayoutDashboard,
  CalendarClock,
  Zap,
  ReceiptText,
  LogOut,
  RefreshCw,
  Wallet,
  TrendingUp,
  ShieldCheck,
  Loader2,
  Search,
  CircleDollarSign,
} from "lucide-react";

const VCOLOR: Record<string, string> = {
  car: "#d50000",
  bus: "#fcd116",
  truck: "#008751",
};

interface SubRow {
  id: number;
  reference: string;
  fullName: string;
  phone: string;
  plate: string;
  depart: string;
  arrivee: string;
  travelDate: string;
  vehicleType: string;
  distanceKm: number;
  gates: number;
  amount: number;
  status: string;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string;
}
interface PasRow {
  id: number;
  reference: string;
  fullName: string;
  phone: string;
  plate: string;
  station: string;
  stationName: string;
  direction: string;
  vehicleType: string;
  amount: number;
  status: string;
  paymentMethod: string | null;
  paidAt: string | null;
  createdAt: string;
}
interface TxnRow {
  id: number;
  reference: string;
  kind: string;
  relatedReference: string;
  payerName: string;
  phone: string;
  plate: string;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}
interface Stats {
  revenueTotal: number;
  revenueToday: number;
  transactionsCount: number;
  subsTotal: number;
  subsPaid: number;
  subsPending: number;
  passTotal: number;
  passPaid: number;
  passPending: number;
  series: { key: string; label: string; total: number; count: number }[];
  byVehicle: { type: string; total: number }[];
  byStation: { id: string; name: string; total: number; count: number }[];
  byMethod: { method: string; total: number }[];
}

type Tab = "overview" | "subscriptions" | "passages" | "transactions";

async function fj<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "no-store" });
  if (!r.ok) {
    const e = new Error(r.statusText) as Error & { status: number };
    e.status = r.status;
    throw e;
  }
  return r.json() as Promise<T>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [booted, setBooted] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [pass, setPass] = useState<PasRow[]>([]);
  const [txns, setTxns] = useState<TxnRow[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, su, pa, tx] = await Promise.all([
        fj<Stats>("/api/admin/stats"),
        fj<{ rows: SubRow[] }>("/api/admin/subscriptions"),
        fj<{ rows: PasRow[] }>("/api/admin/passages"),
        fj<{ rows: TxnRow[] }>("/api/admin/transactions"),
      ]);
      setStats(s);
      setSubs(su.rows);
      setPass(pa.rows);
      setTxns(tx.rows);
      setAuthed(true);
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err.status === 401) {
        router.replace("/admin/login");
        return;
      }
      setAuthed(true);
    } finally {
      setBooted(true);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  async function updateStatus(reference: string, status: string) {
    await fetch(`/api/admin/records/${reference}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setRefreshing(true);
    await load();
  }

  const filterRows = <T extends { reference: string; plate: string; status: string }>(
    rows: T[],
  ) => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const okStatus = statusFilter === "all" || r.status === statusFilter;
      const okQuery =
        !q ||
        r.reference.toLowerCase().includes(q) ||
        r.plate.toLowerCase().includes(q);
      return okStatus && okQuery;
    });
  };

  const fSubs = useMemo(() => filterRows(subs), [subs, query, statusFilter]);
  const fPass = useMemo(() => filterRows(pass), [pass, query, statusFilter]);
  const fTxns = useMemo(() => filterRows(txns), [txns, query, statusFilter]);

  if (!booted) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#fbf7f7]">
        <div className="flex flex-col items-center gap-3 text-ink-soft">
          <Loader2 size={30} className="animate-spin-slow text-brand" />
          Chargement du tableau de bord…
        </div>
      </div>
    );
  }

  if (!authed) return null;

  const navItems: { id: Tab; label: string; icon: typeof LayoutDashboard; count?: number }[] = [
    { id: "overview", label: "Vue d’ensemble", icon: LayoutDashboard },
    { id: "subscriptions", label: "Abonnements", icon: CalendarClock, count: subs.length },
    { id: "passages", label: "Passages", icon: Zap, count: pass.length },
    { id: "transactions", label: "Transactions", icon: ReceiptText, count: txns.length },
  ];

  return (
    <div className="min-h-screen bg-[#fbf7f7]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 glass border-b border-brand/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="hidden rounded-full bg-brand-soft px-3 py-1 text-xs font-bold text-brand-dark sm:inline">
              Administration
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setRefreshing(true);
                load();
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-brand/15 bg-white px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-brand"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin-slow" : ""} />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[230px_1fr]">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <nav className="card flex gap-1 overflow-x-auto p-2 lg:flex-col">
            {navItems.map((n) => {
              const active = tab === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    setTab(n.id);
                    setQuery("");
                    setStatusFilter("all");
                  }}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active
                      ? "bg-brand text-white shadow-[0_8px_20px_-10px_rgba(213,0,0,0.7)]"
                      : "text-ink-soft hover:bg-brand-soft/50 hover:text-ink"
                  }`}
                >
                  <n.icon size={17} />
                  <span className="whitespace-nowrap">{n.label}</span>
                  {n.count !== undefined && (
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-xs ${
                        active ? "bg-white/20" : "bg-brand-soft text-brand-dark"
                      }`}
                    >
                      {n.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="card mt-4 hidden p-4 lg:block">
            <p className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
              <ShieldCheck size={14} className="text-leaf" /> Session sécurisée
            </p>
            <Link
              href="/"
              className="mt-2 block text-xs font-semibold text-brand hover:underline"
            >
              ← Retour au site public
            </Link>
          </div>
        </aside>

        {/* Content */}
        <div className="min-w-0">
          {tab === "overview" && stats && (
            <Overview stats={stats} />
          )}

          {tab !== "overview" && (
            <DataTable
              tab={tab}
              query={query}
              setQuery={setQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              fSubs={fSubs}
              fPass={fPass}
              fTxns={fTxns}
              updateStatus={updateStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- OVERVIEW ---------------- */
function Overview({ stats }: { stats: Stats }) {
  const kpis = [
    {
      label: "Revenu total",
      value: formatFCFA(stats.revenueTotal),
      icon: Wallet,
      tone: "brand",
    },
    {
      label: "Revenu aujourd’hui",
      value: formatFCFA(stats.revenueToday),
      icon: TrendingUp,
      tone: "leaf",
    },
    {
      label: "Abonnements réglés",
      value: `${stats.subsPaid}`,
      sub: `sur ${stats.subsTotal}`,
      icon: CalendarClock,
      tone: "gold",
    },
    {
      label: "Passages réglés",
      value: `${stats.passPaid}`,
      sub: `sur ${stats.passTotal}`,
      icon: Zap,
      tone: "sky",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const tones: Record<string, string> = {
            brand: "bg-brand-soft text-brand",
            leaf: "bg-leaf/10 text-leaf",
            gold: "bg-gold/15 text-gold-dark",
            sky: "bg-sky-100 text-sky-600",
          };
          return (
            <div key={k.label} className="card card-hover p-5">
              <div className="flex items-center justify-between">
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${tones[k.tone]}`}>
                  <k.icon size={20} />
                </span>
                <CircleDollarSign size={18} className="text-brand/20" />
              </div>
              <p className="mt-3 font-display text-2xl font-extrabold text-ink">
                {k.value}
              </p>
              <p className="text-xs text-ink-soft">
                {k.label}{" "}
                {k.sub && <span className="text-ink-soft/70">({k.sub})</span>}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-ink">
                Revenu des 7 derniers jours
              </h3>
              <p className="text-xs text-ink-soft">En FCFA</p>
            </div>
            <span className="chip bg-brand-soft text-brand-dark">
              <TrendingUp size={13} /> {stats.transactionsCount} transactions
            </span>
          </div>
          <BarChart
            data={stats.series.map((d) => ({ label: d.label, value: d.total }))}
            formatValue={(v) => formatFCFA(v)}
          />
        </div>
        <div className="card p-5">
          <h3 className="mb-4 font-display text-base font-bold text-ink">
            Par type de véhicule
          </h3>
          <Donut
            data={stats.byVehicle.map((v) => ({
              label: vehicleName(v.type),
              value: v.total,
              color: VCOLOR[v.type],
            }))}
            formatValue={(v) => formatFCFA(v)}
          />
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 font-display text-base font-bold text-ink">
            Postes de péage les plus actifs
          </h3>
          <HBar
            data={stats.byStation
              .slice(0, 6)
              .map((s) => ({ label: s.name, value: s.total }))}
            formatValue={(v) => formatFCFA(v)}
          />
        </div>
        <div className="card p-5">
          <h3 className="mb-4 font-display text-base font-bold text-ink">
            Moyens de paiement
          </h3>
          <Donut
            data={stats.byMethod.map((m) => ({
              label: paymentName(m.method),
              value: m.total,
              color: PAYMENT_METHODS.find((p) => p.id === m.method)?.color,
            }))}
            formatValue={(v) => formatFCFA(v)}
          />
        </div>
      </div>

      {/* pending alerts */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card flex items-center gap-4 p-5">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-100 text-amber-600">
            <CalendarClock size={22} />
          </span>
          <div>
            <p className="font-display text-xl font-extrabold text-ink">
              {stats.subsPending}
            </p>
            <p className="text-sm text-ink-soft">Abonnements en attente de paiement</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-amber-100 text-amber-600">
            <Zap size={22} />
          </span>
          <div>
            <p className="font-display text-xl font-extrabold text-ink">
              {stats.passPending}
            </p>
            <p className="text-sm text-ink-soft">Passages en attente de paiement</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- DATA TABLE ---------------- */
function DataTable({
  tab,
  query,
  setQuery,
  statusFilter,
  setStatusFilter,
  fSubs,
  fPass,
  fTxns,
  updateStatus,
}: {
  tab: Tab;
  query: string;
  setQuery: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  fSubs: SubRow[];
  fPass: PasRow[];
  fTxns: TxnRow[];
  updateStatus: (ref: string, status: string) => void;
}) {
  const title =
    tab === "subscriptions"
      ? "Abonnements (Mode Prédéfini)"
      : tab === "passages"
        ? "Passages (Mode Instantané)"
        : "Transactions";
  const rows =
    tab === "subscriptions" ? fSubs : tab === "passages" ? fPass : fTxns;

  return (
    <div className="space-y-4">
      {/* toolbar */}
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
          <p className="text-xs text-ink-soft">{rows.length} enregistrement(s)</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              className="input-field !py-2 !pl-9 sm:w-56"
              placeholder="Référence ou plaque…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["all", "pending", "paid", "used", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === s
                    ? "bg-brand text-white"
                    : "bg-brand-soft/50 text-ink-soft hover:bg-brand-soft"
                }`}
              >
                {s === "all" ? "Tous" : s === "pending" ? "Attente" : s === "paid" ? "Payé" : s === "used" ? "Utilisé" : "Annulé"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-brand/10 bg-brand-soft/30 text-left text-xs uppercase tracking-wide text-ink-soft">
                {tab === "transactions" ? (
                  <>
                    <Th>Transaction</Th>
                    <Th>Type</Th>
                    <Th>Payeur</Th>
                    <Th>Plaque</Th>
                    <Th>Moyen</Th>
                    <Th>Montant</Th>
                    <Th>Statut</Th>
                    <Th>Date</Th>
                  </>
                ) : (
                  <>
                    <Th>Référence</Th>
                    <Th>Bénéficiaire</Th>
                    <Th>Plaque</Th>
                    {tab === "subscriptions" ? <Th>Trajet</Th> : <Th>Poste</Th>}
                    <Th>Montant</Th>
                    <Th>Statut</Th>
                    <Th>Action</Th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-ink-soft">
                    Aucun enregistrement.
                  </td>
                </tr>
              )}
              {tab === "subscriptions" &&
                fSubs.map((r) => (
                  <tr key={r.id} className="border-b border-brand/5 hover:bg-brand-soft/20">
                    <Td>
                      <span className="font-mono text-xs font-bold text-ink">{r.reference}</span>
                      <span className="block text-[0.7rem] text-ink-soft">{formatShortDate(r.travelDate)}</span>
                    </Td>
                    <Td>
                      <span className="font-semibold text-ink">{r.fullName}</span>
                      <span className="block text-[0.7rem] text-ink-soft">{r.phone}</span>
                    </Td>
                    <Td><span className="font-mono text-xs">{r.plate}</span></Td>
                    <Td>
                      {cityName(r.depart)} → {cityName(r.arrivee)}
                      <span className="block text-[0.7rem] text-ink-soft">{r.distanceKm} km · {r.gates} porte(s)</span>
                    </Td>
                    <Td><span className="font-bold text-ink">{formatFCFA(r.amount)}</span></Td>
                    <Td><StatusBadge status={r.status} /></Td>
                    <Td>
                      <StatusSelect value={r.status} onChange={(v) => updateStatus(r.reference, v)} />
                    </Td>
                  </tr>
                ))}
              {tab === "passages" &&
                fPass.map((r) => (
                  <tr key={r.id} className="border-b border-brand/5 hover:bg-brand-soft/20">
                    <Td>
                      <span className="font-mono text-xs font-bold text-ink">{r.reference}</span>
                    </Td>
                    <Td>
                      <span className="font-semibold text-ink">{r.fullName}</span>
                      <span className="block text-[0.7rem] text-ink-soft">{r.phone}</span>
                    </Td>
                    <Td><span className="font-mono text-xs">{r.plate}</span></Td>
                    <Td>
                      {stationName(r.station)}
                      <span className="block text-[0.7rem] text-ink-soft">{r.direction}</span>
                    </Td>
                    <Td><span className="font-bold text-ink">{formatFCFA(r.amount)}</span></Td>
                    <Td><StatusBadge status={r.status} /></Td>
                    <Td>
                      <StatusSelect value={r.status} onChange={(v) => updateStatus(r.reference, v)} />
                    </Td>
                  </tr>
                ))}
              {tab === "transactions" &&
                fTxns.map((r) => (
                  <tr key={r.id} className="border-b border-brand/5 hover:bg-brand-soft/20">
                    <Td><span className="font-mono text-xs font-bold text-ink">{r.reference}</span></Td>
                    <Td>
                      <span className={`chip ${r.kind === "subscription" ? "bg-brand-soft text-brand-dark" : "bg-leaf/10 text-leaf"}`}>
                        {r.kind === "subscription" ? "Abonnement" : "Passage"}
                      </span>
                    </Td>
                    <Td>
                      <span className="font-semibold text-ink">{r.payerName}</span>
                      <span className="block text-[0.7rem] text-ink-soft">{r.phone}</span>
                    </Td>
                    <Td><span className="font-mono text-xs">{r.plate}</span></Td>
                    <Td>{paymentName(r.paymentMethod)}</Td>
                    <Td><span className="font-bold text-ink">{formatFCFA(r.amount)}</span></Td>
                    <Td><StatusBadge status={r.status} /></Td>
                    <Td><span className="text-xs text-ink-soft">{formatDateTime(r.createdAt)}</span></Td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold">{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 align-top text-ink">{children}</td>;
}

function StatusSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-brand/15 bg-white px-2 py-1.5 text-xs font-semibold text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
    >
      <option value="pending">→ En attente</option>
      <option value="paid">→ Payé</option>
      <option value="used">→ Utilisé</option>
      <option value="cancelled">→ Annulé</option>
    </select>
  );
}
