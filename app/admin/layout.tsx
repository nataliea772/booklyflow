import AdminAuthGuard from "@/components/AdminAuthGuard";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-polka-bg min-h-full overflow-x-hidden">
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </div>
  );
}
