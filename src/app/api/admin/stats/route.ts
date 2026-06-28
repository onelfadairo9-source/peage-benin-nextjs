import { db } from "@/db";
import { transactions, subscriptions, passages } from "@/db/schema";
import { isAdmin, pruneExpiredSessions } from "@/lib/auth";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ message: "Non autorisé" }, { status: 401 });
  }
  await pruneExpiredSessions();

  const [tx, subs, pass] = await Promise.all([
    db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(1000),
    db
      .select()
      .from(subscriptions)
      .orderBy(desc(subscriptions.createdAt))
      .limit(1000),
    db
      .select()
      .from(passages)
      .orderBy(desc(passages.createdAt))
      .limit(1000),
  ]);

  const successTx = tx.filter((t) => t.status === "success");
  const revenueTotal = successTx.reduce((a, t) => a + t.amount, 0);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const revenueToday = successTx
    .filter((t) => new Date(t.createdAt) >= todayStart)
    .reduce((a, t) => a + t.amount, 0);

  const series: { key: string; label: string; total: number; count: number }[] =
    [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    series.push({
      key: dayKey(d),
      label: d.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "2-digit",
      }),
      total: 0,
      count: 0,
    });
  }
  const dayMap = new Map(series.map((d) => [d.key, d]));
  for (const t of successTx) {
    const e = dayMap.get(dayKey(new Date(t.createdAt)));
    if (e) {
      e.total += t.amount;
      e.count += 1;
    }
  }

  const byVehicle = new Map<string, number>();
  const addV = (vt: string, amt: number) =>
    byVehicle.set(vt, (byVehicle.get(vt) ?? 0) + amt);
  for (const s of subs)
    if (s.status === "paid" || s.status === "used") addV(s.vehicleType, s.amount);
  for (const p of pass)
    if (p.status === "paid" || p.status === "used") addV(p.vehicleType, p.amount);

  const byStation = new Map<
    string,
    { id: string; name: string; total: number; count: number }
  >();
  for (const p of pass) {
    if (p.status === "paid" || p.status === "used") {
      const cur = byStation.get(p.station) ?? {
        id: p.station,
        name: p.stationName,
        total: 0,
        count: 0,
      };
      cur.total += p.amount;
      cur.count += 1;
      byStation.set(p.station, cur);
    }
  }

  const byMethod = new Map<string, number>();
  for (const t of successTx)
    byMethod.set(t.paymentMethod, (byMethod.get(t.paymentMethod) ?? 0) + t.amount);

  const subsPaid = subs.filter(
    (s) => s.status === "paid" || s.status === "used",
  ).length;
  const subsPending = subs.filter((s) => s.status === "pending").length;
  const passPaid = pass.filter(
    (p) => p.status === "paid" || p.status === "used",
  ).length;
  const passPending = pass.filter((p) => p.status === "pending").length;

  return Response.json({
    revenueTotal,
    revenueToday,
    transactionsCount: successTx.length,
    subsTotal: subs.length,
    subsPaid,
    subsPending,
    passTotal: pass.length,
    passPaid,
    passPending,
    series,
    byVehicle: [...byVehicle.entries()].map(([type, total]) => ({
      type,
      total,
    })),
    byStation: [...byStation.values()].sort((a, b) => b.total - a.total),
    byMethod: [...byMethod.entries()].map(([method, total]) => ({
      method,
      total,
    })),
  });
}
