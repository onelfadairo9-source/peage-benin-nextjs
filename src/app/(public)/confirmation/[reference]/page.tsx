import { notFound } from "next/navigation";
import { getRecordByReference } from "@/lib/services";
import { ConfirmationClient, type ReceiptData } from "@/components/ConfirmationClient";

export const dynamic = "force-dynamic";

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const rec = await getRecordByReference(reference);
  if (!rec) notFound();

  const data: ReceiptData = {
    reference: rec.reference,
    kind: rec.kind,
    fullName: rec.fullName,
    phone: rec.phone,
    email: rec.email,
    plate: rec.plate,
    vehicleType: rec.vehicleType,
    amount: rec.amount,
    status: rec.status,
    paymentMethod: rec.paymentMethod,
    createdAt: rec.createdAt.toISOString(),
    paidAt: rec.paidAt ? rec.paidAt.toISOString() : null,
    details: rec.details,
  };

  return <ConfirmationClient data={data} />;
}
