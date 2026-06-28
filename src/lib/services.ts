import { db } from "@/db";
import { subscriptions, passages, transactions } from "@/db/schema";
import { calculatePrice } from "./pricing";
import { cityName, stationName, vehicleRate } from "./constants";
import { eq, or, ilike, desc, and } from "drizzle-orm";

export const REF = {
  SUBSCRIPTION: "PRE",
  PASSAGE: "INS",
  TXN: "TXN",
} as const;

function dateStamp(): string {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

function rand(len: number): string {
  let s = "";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let i = 0; i < len; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function generateReference(prefix: string): string {
  return `${prefix}-${dateStamp()}-${rand(4)}`;
}

export function normalizePlate(plate: string): string {
  return plate
    .toUpperCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "");
}

export function normalizePhone(phone: string): string {
  return phone.trim().replace(/[^\d+]/g, "");
}

export function isValidPhone(phone: string): boolean {
  const p = normalizePhone(phone).replace(/^\+229/, "").replace(/^0+/, "");
  return /^\d{8}$/.test(p);
}

export function isValidPlate(plate: string): boolean {
  const p = normalizePlate(plate);
  return /[A-Z]/.test(p) && /\d/.test(p) && p.length >= 4 && p.length <= 12;
}

export interface SubscriptionInput {
  fullName: string;
  phone: string;
  email?: string;
  plate: string;
  depart: string;
  arrivee: string;
  travelDate: string;
  vehicleType: string;
}

export async function createSubscription(input: SubscriptionInput) {
  const quote = calculatePrice(input.depart, input.arrivee, input.vehicleType);
  const reference = generateReference(REF.SUBSCRIPTION);
  const plate = normalizePlate(input.plate);
  const [row] = await db
    .insert(subscriptions)
    .values({
      reference,
      fullName: input.fullName.trim(),
      phone: normalizePhone(input.phone),
      email: input.email?.trim() || null,
      plate,
      depart: input.depart,
      arrivee: input.arrivee,
      travelDate: input.travelDate,
      vehicleType: input.vehicleType,
      distanceKm: quote.distance,
      gates: quote.gates,
      amount: quote.amount,
      status: "pending",
    })
    .returning();
  return { row: row!, quote };
}

export interface PassageInput {
  fullName: string;
  phone: string;
  plate: string;
  station: string;
  direction: string;
  vehicleType: string;
}

export async function createPassage(input: PassageInput) {
  const rate = vehicleRate(input.vehicleType);
  const reference = generateReference(REF.PASSAGE);
  const plate = normalizePlate(input.plate);
  const station = input.station;
  const [row] = await db
    .insert(passages)
    .values({
      reference,
      fullName: input.fullName.trim(),
      phone: normalizePhone(input.phone),
      plate,
      station,
      stationName: stationName(station),
      direction: input.direction,
      vehicleType: input.vehicleType,
      amount: rate,
      status: "pending",
    })
    .returning();
  return { row: row!, amount: rate };
}

export type AnyRecord = {
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
  createdAt: Date;
  paidAt: Date | null;
  details: Record<string, string>;
};

export async function getRecordByReference(
  reference: string,
): Promise<AnyRecord | null> {
  const ref = reference.trim().toUpperCase();
  if (ref.startsWith(REF.SUBSCRIPTION)) {
    const rows = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.reference, ref))
      .limit(1);
    const s = rows[0];
    if (!s) return null;
    return {
      reference: s.reference,
      kind: "subscription",
      fullName: s.fullName,
      phone: s.phone,
      email: s.email,
      plate: s.plate,
      vehicleType: s.vehicleType,
      amount: s.amount,
      status: s.status,
      paymentMethod: s.paymentMethod,
      createdAt: s.createdAt,
      paidAt: s.paidAt,
      details: {
        "Trajet": `${cityName(s.depart)} → ${cityName(s.arrivee)}`,
        "Distance": `${s.distanceKm} km`,
        "Portes de péage": String(s.gates),
        "Date de passage": s.travelDate,
      },
    };
  }
  if (ref.startsWith(REF.PASSAGE)) {
    const rows = await db
      .select()
      .from(passages)
      .where(eq(passages.reference, ref))
      .limit(1);
    const p = rows[0];
    if (!p) return null;
    return {
      reference: p.reference,
      kind: "passage",
      fullName: p.fullName,
      phone: p.phone,
      email: null,
      plate: p.plate,
      vehicleType: p.vehicleType,
      amount: p.amount,
      status: p.status,
      paymentMethod: p.paymentMethod,
      createdAt: p.createdAt,
      paidAt: p.paidAt,
      details: {
        "Poste de péage": p.stationName,
        "Sens": p.direction,
      },
    };
  }
  return null;
}

export interface PaymentResult {
  success: boolean;
  message: string;
  record?: AnyRecord;
}

/** Traite un paiement pour une référence donnée (Mode Prédéfini ou Instantané). */
export async function processPayment(
  reference: string,
  paymentMethod: string,
): Promise<PaymentResult> {
  const ref = reference.trim().toUpperCase();
  const record = await getRecordByReference(ref);
  if (!record) {
    return { success: false, message: "Référence introuvable." };
  }
  if (record.status === "paid" || record.status === "used") {
    return {
      success: false,
      message: "Ce trajet / passage a déjà été réglé.",
      record,
    };
  }
  if (record.status === "cancelled") {
    return {
      success: false,
      message: "Ce trajet / passage a été annulé.",
      record,
    };
  }

  const now = new Date();
  const txRef = generateReference(REF.TXN);

  if (record.kind === "subscription") {
    await db
      .update(subscriptions)
      .set({ status: "paid", paymentMethod, paidAt: now })
      .where(eq(subscriptions.reference, ref));
  } else {
    await db
      .update(passages)
      .set({ status: "paid", paymentMethod, paidAt: now })
      .where(eq(passages.reference, ref));
  }

  await db.insert(transactions).values({
    reference: txRef,
    kind: record.kind,
    relatedReference: ref,
    payerName: record.fullName,
    phone: record.phone,
    plate: record.plate,
    amount: record.amount,
    paymentMethod,
    status: "success",
  });

  const updated = await getRecordByReference(ref);
  return {
    success: true,
    message: "Paiement effectué avec succès.",
    record: updated ?? undefined,
  };
}

/**
 * Traite un paiement RÉEL déjà vérifié auprès de Kkiapay (voir
 * /api/payment/verify). Ne doit être appelée qu'après confirmation serveur
 * de la transaction — jamais directement à partir d'une donnée envoyée par
 * le navigateur sans vérification.
 */
export async function processVerifiedPayment(
  reference: string,
  paymentMethod: string,
  kkiapayTransactionId: string,
): Promise<PaymentResult> {
  const ref = reference.trim().toUpperCase();
  const record = await getRecordByReference(ref);
  if (!record) {
    return { success: false, message: "Référence introuvable." };
  }
  if (record.status === "paid" || record.status === "used") {
    // Déjà activé (ex: double-clic ou nouvelle vérification du même paiement) :
    // pas une erreur, on renvoie simplement l'état actuel.
    return {
      success: true,
      message: "Paiement déjà confirmé.",
      record,
    };
  }
  if (record.status === "cancelled") {
    return {
      success: false,
      message: "Ce trajet / passage a été annulé.",
      record,
    };
  }

  const now = new Date();
  const txRef = generateReference(REF.TXN);

  if (record.kind === "subscription") {
    await db
      .update(subscriptions)
      .set({ status: "paid", paymentMethod, paidAt: now })
      .where(eq(subscriptions.reference, ref));
  } else {
    await db
      .update(passages)
      .set({ status: "paid", paymentMethod, paidAt: now })
      .where(eq(passages.reference, ref));
  }

  await db.insert(transactions).values({
    reference: txRef,
    kind: record.kind,
    relatedReference: ref,
    payerName: record.fullName,
    phone: record.phone,
    plate: record.plate,
    amount: record.amount,
    paymentMethod: `kkiapay:${paymentMethod}`,
    status: "success",
  });

  const updated = await getRecordByReference(ref);
  return {
    success: true,
    message: "Paiement confirmé par Kkiapay.",
    record: updated ?? undefined,
  };
}

/** Recherche publique par référence ou plaque. */
export async function publicLookup(query: string) {
  const q = query.trim();
  if (!q) return { subscriptions: [], passages: [] };
  const plate = normalizePlate(q);
  const ref = q.toUpperCase();
  const subQ = db
    .select()
    .from(subscriptions)
    .where(
      or(
        ilike(subscriptions.reference, `%${ref}%`),
        ilike(subscriptions.plate, `%${plate}%`),
      ),
    )
    .orderBy(desc(subscriptions.createdAt))
    .limit(20);
  const pasQ = db
    .select()
    .from(passages)
    .where(
      or(
        ilike(passages.reference, `%${ref}%`),
        ilike(passages.plate, `%${plate}%`),
      ),
    )
    .orderBy(desc(passages.createdAt))
    .limit(20);
  const [subs, pass] = await Promise.all([subQ, pasQ]);
  return { subscriptions: subs, passages: pass };
}

export async function verifyPlateToday(plate: string) {
  const p = normalizePlate(plate);
  const today = new Date().toISOString().slice(0, 10);
  const sub = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.plate, p),
        eq(subscriptions.travelDate, today),
        eq(subscriptions.status, "paid"),
      ),
    )
    .limit(1);
  const pas = await db
    .select()
    .from(passages)
    .where(and(eq(passages.plate, p), eq(passages.status, "paid")))
    .orderBy(desc(passages.paidAt))
    .limit(1);
  return { subscription: sub[0] ?? null, passage: pas[0] ?? null };
}

/** Mise à jour du statut d'un trajet / passage (espace admin). */
export async function updateRecordStatus(
  reference: string,
  status: string,
): Promise<{ success: boolean; message: string }> {
  const ref = reference.trim().toUpperCase();
  const record = await getRecordByReference(ref);
  if (!record) return { success: false, message: "Référence introuvable." };
  const allowed = ["pending", "paid", "used", "cancelled"];
  if (!allowed.includes(status))
    return { success: false, message: "Statut invalide." };
  if (record.kind === "subscription") {
    await db
      .update(subscriptions)
      .set({ status })
      .where(eq(subscriptions.reference, ref));
  } else {
    await db
      .update(passages)
      .set({ status })
      .where(eq(passages.reference, ref));
  }
  return { success: true, message: "Statut mis à jour." };
}
