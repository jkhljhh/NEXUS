// Filename: layout.tsx
// Path: @/app/(dashboard)/

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="p-4 flex flex-col flex-1 w-full mx-auto max-w-4xl overflow-hidden">
      {children}
    </div>
  );
}
