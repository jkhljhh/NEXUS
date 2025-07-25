// Filename: layout.tsx
// Path: @/app/(dashboard)/

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="p-4">{children}</div>;
}
