import crypto from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/db";
import { adminSessions } from "@/db/schema";
import { eq, lt } from "drizzle-orm";

export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "peage2026";

const COOKIE_NAME = "peage_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24; // 24 h

export async function createAdminSession(): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(adminSessions).values({ token, expiresAt });
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return token;
}

export async function destroyAdminSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(adminSessions).where(eq(adminSessions.token, token));
  }
  store.delete(COOKIE_NAME);
}

export async function getSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value;
}

export async function isAdmin(): Promise<boolean> {
  const token = await getSessionToken();
  if (!token) return false;
  const rows = await db
    .select()
    .from(adminSessions)
    .where(eq(adminSessions.token, token))
    .limit(1);
  if (!rows[0]) return false;
  if (new Date(rows[0].expiresAt).getTime() < Date.now()) {
    await db.delete(adminSessions).where(eq(adminSessions.token, token));
    return false;
  }
  return true;
}

/** Nettoyage périodique des sessions expirées. */
export async function pruneExpiredSessions(): Promise<void> {
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
}
