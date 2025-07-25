// Filename: layout.tsx
// Path: @/app/
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import "@/app/globals.css";
import { ConvexClientProvider } from "@/providers/convex";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: {
    template: `%s | ${site.title}`,
    default: site.title,
  },
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body className={cn(GeistSans.variable, GeistMono.variable)}>
        <NuqsAdapter>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </NuqsAdapter>
        <Toaster richColors theme="light" />
      </body>
    </html>
  );
}
