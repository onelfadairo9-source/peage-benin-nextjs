import { db } from "@/db";
import { transactions } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ message: "Non autorisé" }, { status: 401 });
  }
  const rows = await db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.createdAt))
    .limit(500);
  return Response.json({ rows });
}
