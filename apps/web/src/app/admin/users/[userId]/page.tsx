import { AdminUserDetailClient } from "@/components/admin/admin-user-detail-client";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  return <AdminUserDetailClient userId={userId} />;
}
