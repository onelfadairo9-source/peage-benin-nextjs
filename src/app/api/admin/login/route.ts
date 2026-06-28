import {
  createAdminSession,
  pruneExpiredSessions,
  ADMIN_USERNAME,
  ADMIN_PASSWORD,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (
      String(username) === ADMIN_USERNAME &&
      String(password) === ADMIN_PASSWORD
    ) {
      await pruneExpiredSessions();
      await createAdminSession();
      return Response.json({ success: true });
    }
    return Response.json(
      { success: false, message: "Identifiants incorrects." },
      { status: 401 },
    );
  } catch {
    return Response.json(
      { success: false, message: "Requête invalide." },
      { status: 400 },
    );
  }
}
