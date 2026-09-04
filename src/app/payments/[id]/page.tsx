import { redirect } from "next/navigation";

export default async function PaymentsIdRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/payments/${id}`);
}
