"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  type Icon,
  IconCreditCard,
  IconLogout,
  IconNotification,
  IconUserCircle,
  IconDots,
  IconTrash,
  IconEdit,
  IconChartFunnel,
  IconLibrary,
  IconBook2,
  IconFolder,
  IconFolderPlus,
  IconPlus,
  IconMessage,
  IconMessageCircle,
} from "@tabler/icons-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  useSidebar,
  Sidebar,
  SidebarMenu,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarMenuAction,
  SidebarGroupAction,
} from "@/components/ui/sidebar";
import { site } from "@/config/site";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props} className="gap-2">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <Image src={site.logo} alt={site.title} className="w-6" />
                <span className="text-base font-semibold">{site.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavActions />
        <NavChats />
        <NavReports />
        {/* <NavProjects2 /> */}
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function NavActions() {
  const actions = [
    {
      name: "New Analysis",
      icon: IconChartFunnel,
      url: "/",
    },
    {
      name: "My Analysis",
      icon: IconLibrary,
      url: "/my-analysis",
    },
    {
      name: "My Reports",
      icon: IconBook2,
      url: "my-reports",
    },
    // {
    //   name: "Start Analysis",
    //   icon: IconReportAnalytics,
    //   url: "#",
    // },
  ];

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <NavItem items={actions} />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function NavChats() {
  const chats = useQuery(api.chat.getRecent);
  const items = chats?.map((item) => ({
    name: item.title,
    url: `/c/${item._id}`,
    options: true,
    icon: IconMessageCircle,
  }));

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Chats</SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu>
          <NavItem items={items} />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function NavReports() {
  const reports = useQuery(api.report.getAll);
  const items = reports?.map((item) => ({
    name: item.name,
    url: `/p/${item._id}`,
    options: true,
    icon: IconFolder,
  }));

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Reports</SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu>
          <NavItem items={items} />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function NavItem({
  items,
}: {
  items?: {
    name: string;
    url: string;
    icon?: Icon;
    options?: boolean;
  }[];
}) {
  const { isMobile } = useSidebar();
  return (
    <>
      {items?.map((item) => (
        <SidebarMenuItem key={item.name}>
          <SidebarMenuButton asChild>
            <Link href={item.url}>
              {item.icon && <item.icon />}
              <span>{item.name}</span>
            </Link>
          </SidebarMenuButton>
          {item.options && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction
                  showOnHover
                  className="data-[state=open]:bg-accent rounded-sm"
                >
                  <IconDots />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-24 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <IconEdit />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  <IconTrash />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </SidebarMenuItem>
      ))}
    </>
  );
}

export function NavUser({ user }: { user: User }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out successfully!");
    router.replace("/sign-in");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={"size-7"}>
          <IconUserCircle className="size-4.5" />
          <span className="sr-only">Toggle Profile</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            {/* <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar> */}
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {user.user_metadata.display_name}
              </span>
              <span className="text-muted-foreground truncate text-xs">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <IconUserCircle />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconCreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconNotification />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <IconLogout />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
