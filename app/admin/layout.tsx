import AdminAuthGuard from "@/components/AdminAuthGuard";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminAuthGuard>{children}</AdminAuthGuard>;
}
