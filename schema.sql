-- Schéma de la base de données Péage Bénin
-- À exécuter UNE SEULE FOIS sur votre base PostgreSQL avant le premier démarrage.

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  plate TEXT NOT NULL,
  depart TEXT NOT NULL,
  arrivee TEXT NOT NULL,
  travel_date DATE NOT NULL,
  vehicle_type TEXT NOT NULL,
  distance_km INTEGER NOT NULL,
  gates INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sub_plate_idx ON subscriptions (plate);
CREATE INDEX IF NOT EXISTS sub_status_idx ON subscriptions (status);
CREATE INDEX IF NOT EXISTS sub_created_idx ON subscriptions (created_at);

CREATE TABLE IF NOT EXISTS passages (
  id SERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  plate TEXT NOT NULL,
  station TEXT NOT NULL,
  station_name TEXT NOT NULL,
  direction TEXT NOT NULL,
  vehicle_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS pas_plate_idx ON passages (plate);
CREATE INDEX IF NOT EXISTS pas_status_idx ON passages (status);
CREATE INDEX IF NOT EXISTS pas_created_idx ON passages (created_at);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL,
  related_reference TEXT NOT NULL,
  payer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  plate TEXT NOT NULL,
  amount INTEGER NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS tx_kind_idx ON transactions (kind);
CREATE INDEX IF NOT EXISTS tx_status_idx ON transactions (status);
CREATE INDEX IF NOT EXISTS tx_created_idx ON transactions (created_at);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);
