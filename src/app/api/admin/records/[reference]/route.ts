import { updateRecordStatus } from "@/lib/services";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  if (!(await isAdmin())) {
    return Response.json({ message: "Non autorisé" }, { status: 401 });
  }
  const { reference } = await params;
  const { status } = await req.json();
  const result = await updateRecordStatus(reference, String(status));
  return Response.json(result, { status: result.success ? 200 : 400 });
}
