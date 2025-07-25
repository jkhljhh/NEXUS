"use client";

import { useQueryState } from "nuqs";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  IconBroadcast,
  IconClick,
  IconEyeSearch,
  IconFileAnalytics,
  IconListDetails,
  IconListSearch,
} from "@tabler/icons-react";
import { useEffect } from "react";
import { Skeleton } from "./ui/skeleton";

function ChatTabs({
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  const [tab, setTab] = useQueryState("tab");

  useEffect(() => {
    if (!tab) setTab("summary");
  }, [tab, setTab]);

  // Skeleton
  if (!tab) {
    return (
      <div className="space-y-2">
        {["60%", "70%", "40%", "90%", "75%"].map((width, i) => (
          <Skeleton key={i} className="h-6" style={{ width }} />
        ))}
      </div>
    );
  }

  return (
    <Tabs className="gap-6" value={tab} onValueChange={setTab} {...props} />
  );
}

function ChatTabsList() {
  const tabs = [
    { value: "summary", name: "Summary", icon: IconListDetails },
    { value: "insights", name: "Insights", icon: IconEyeSearch },
    { value: "rca", name: "RCA", icon: IconFileAnalytics },
    { value: "forecast", name: "Forecast", icon: IconBroadcast },
    { value: "actions", name: "Actions", icon: IconClick },
    { value: "analyst", name: "Analyst", icon: IconListSearch },
  ];

  return (
    <TabsList className="mx-auto">
      {tabs.map((item) => (
        <TabsTrigger
          key={item.value}
          value={item.value}
          className="text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
        >
          <item.icon className="size-3.5" /> {item.name}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}

function ChatHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-2">
      <h4 className="font-semibold text-2xl mb-1">{title}</h4>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}
    </div>
  );
}

export { ChatTabs, ChatTabsList, ChatHeader };
