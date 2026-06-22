import AdminAuthGuard from "@/components/AdminAuthGuard";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="overflow-x-hidden">
      <AdminAuthGuard>{children}</AdminAuthGuard>
    </div>
  );
}
