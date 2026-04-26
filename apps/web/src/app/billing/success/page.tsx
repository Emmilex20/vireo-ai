import { BillingSuccessClient } from "@/components/billing/billing-success-client";

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string | string[] }>;
}) {
  const params = await searchParams;
  const reference = Array.isArray(params.reference)
    ? params.reference[0]
    : params.reference;

  return <BillingSuccessClient reference={reference} />;
}
