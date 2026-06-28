import { CheckCircle2, Clock, XCircle, BadgeCheck, RefreshCw } from "lucide-react";

const MAP: Record<
  string,
  { label: string; cls: string; Icon: typeof CheckCircle2 }
> = {
  pending: {
    label: "En attente",
    cls: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
    Icon: Clock,
  },
  paid: {
    label: "Payé",
    cls: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    Icon: CheckCircle2,
  },
  used: {
    label: "Utilisé",
    cls: "bg-sky-100 text-sky-700 ring-1 ring-sky-200",
    Icon: BadgeCheck,
  },
  cancelled: {
    label: "Annulé",
    cls: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
    Icon: XCircle,
  },
  success: {
    label: "Réussi",
    cls: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
    Icon: CheckCircle2,
  },
  failed: {
    label: "Échoué",
    cls: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
    Icon: XCircle,
  },
  refunded: {
    label: "Remboursé",
    cls: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    Icon: RefreshCw,
  },
};

export function StatusBadge({
  status,
  size = "sm",
}: {
  status: string;
  size?: "sm" | "md";
}) {
  const cfg = MAP[status] ?? {
    label: status,
    cls: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    Icon: Clock,
  };
  const Icon = cfg.Icon;
  return (
    <span className={`chip ${cfg.cls}`}>
      <Icon size={size === "md" ? 15 : 13} />
      {cfg.label}
    </span>
  );
}
