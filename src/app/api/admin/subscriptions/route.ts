import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ message: "Non autorisé" }, { status: 401 });
  }
  const rows = await db
    .select()
    .from(subscriptions)
    .orderBy(desc(subscriptions.createdAt))
    .limit(500);
  return Response.json({ rows });
}
