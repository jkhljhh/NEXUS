// Filename: layout.tsx
// Path: @/app/(app)/
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar, NavUser } from "@/components/app-sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/sign-in");
  }

  const cookieStore = await cookies();
  const isCollapsed = cookieStore.get("sidebar_state")?.value !== "true";

  return (
    <SidebarProvider defaultOpen={!isCollapsed}>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-svh">
        {/* <div > */}
        <header className="flex sticky top-0 bg-background py-1.5 items-center justify-between px-2 md:px-2 gap-2 z-10 border-b">
          <SidebarTrigger />
          <NavUser user={data.user} />
        </header>

        {children}
        {/* </div> */}
      </SidebarInset>
    </SidebarProvider>
  );
}
