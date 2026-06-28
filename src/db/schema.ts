import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  date,
  index,
} from "drizzle-orm/pg-core";

/**
 * Abonnements / trajets prépayés (Mode Prédéfini).
 * L'usager programme un trajet à l'avance et paie en ligne.
 */
export const subscriptions = pgTable(
  "subscriptions",
  {
    id: serial("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    plate: text("plate").notNull(),
    depart: text("depart").notNull(),
    arrivee: text("arrivee").notNull(),
    travelDate: date("travel_date").notNull(),
    vehicleType: text("vehicle_type").notNull(),
    distanceKm: integer("distance_km").notNull(),
    gates: integer("gates").notNull(),
    amount: integer("amount").notNull(),
    status: text("status").notNull().default("pending"), // pending | paid | used | cancelled
    paymentMethod: text("payment_method"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    subPlateIdx: index("sub_plate_idx").on(t.plate),
    subStatusIdx: index("sub_status_idx").on(t.status),
    subCreatedIdx: index("sub_created_idx").on(t.createdAt),
  }),
);

/**
 * Passages ponctuels (Mode Instantané).
 * Paiement direct sur la plateforme pour un passage immédiat à un poste.
 */
export const passages = pgTable(
  "passages",
  {
    id: serial("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    plate: text("plate").notNull(),
    station: text("station").notNull(),
    stationName: text("station_name").notNull(),
    direction: text("direction").notNull(),
    vehicleType: text("vehicle_type").notNull(),
    amount: integer("amount").notNull(),
    status: text("status").notNull().default("pending"), // pending | paid | used | cancelled
    paymentMethod: text("payment_method"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    pasPlateIdx: index("pas_plate_idx").on(t.plate),
    pasStatusIdx: index("pas_status_idx").on(t.status),
    pasCreatedIdx: index("pas_created_idx").on(t.createdAt),
  }),
);

/**
 * Journal centralisé de toutes les transactions (abonnements + passages).
 */
export const transactions = pgTable(
  "transactions",
  {
    id: serial("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    kind: text("kind").notNull(), // subscription | passage
    relatedReference: text("related_reference").notNull(),
    payerName: text("payer_name").notNull(),
    phone: text("phone").notNull(),
    plate: text("plate").notNull(),
    amount: integer("amount").notNull(),
    paymentMethod: text("payment_method").notNull(),
    status: text("status").notNull().default("success"), // success | failed | pending
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => ({
    txKindIdx: index("tx_kind_idx").on(t.kind),
    txStatusIdx: index("tx_status_idx").on(t.status),
    txCreatedIdx: index("tx_created_idx").on(t.createdAt),
  }),
);

/**
 * Sessions d'administration (authentification par jeton).
 */
export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});
