"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Error,
  ErrorDescription,
  ErrorIcon,
  ErrorTitle,
} from "@/components/error";
import { IconMessageCircleQuestion } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DataTable } from "./data-table";
import { ChatHeader } from "./chat-content";
import { DataGraph } from "./data-graph";

export function ListMessages({ chatId }: { chatId: Id<"chats"> }) {
  const messages = useQuery(api.message.getAllByChatId, { id: chatId });
  if (messages === undefined) return <Loading />;
  if (messages.length == 0) return <NotFound />;

  return (
    <div className="flex flex-col">
      {messages?.map((item) => (
        <div
          key={item._id}
          className="pb-14 mb-14 border-b last:border-none space-y-6"
        >
          <UserMessage>{item.message}</UserMessage>
          <AssistantMessage>
            {item.table ? (
              "error" in item.table ? (
                <div className="text-sm text-red-500">{item.table.error}</div>
              ) : (
                <div>
                  <ChatHeader
                    title={item.table.title}
                    description={item.table.subtitle}
                  />
                  <DataTable data={item.table.data} />
                </div>
              )
            ) : (
              <LoadingTable />
            )}

            {item.graph ? (
              "error" in item.graph ? (
                <div className="text-sm text-red-500">{item.graph.error}</div>
              ) : (
                <div>
                  <ChatHeader
                    title={item.graph.title}
                    description={item.graph.subtitle}
                  />
                  <DataGraph data={item.graph.data} />
                </div>
              )
            ) : (
              <LoadingGraph />
            )}
          </AssistantMessage>
        </div>
      ))}
    </div>
  );
}

function Loading() {
  return (
    <div className="space-y-2">
      {["60%", "70%", "40%", "90%", "75%"].map((width, i) => (
        <Skeleton key={i} className="h-6" style={{ width }} />
      ))}
    </div>
  );
}

function LoadingHeader() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-full max-w-sm" />
      <Skeleton className="h-6 w-full max-w-lg" />
    </div>
  );
}

function LoadingTable() {
  return (
    <div className="space-y-4">
      <LoadingHeader />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="grid grid-cols-4 gap-4">
          <Skeleton className="h-6 w-full col-span-1" />
          <Skeleton className="h-6 w-full col-span-1" />
          <Skeleton className="h-6 w-full col-span-1" />
          <Skeleton className="h-6 w-full col-span-1" />
        </div>
      ))}
    </div>
  );
}

function LoadingGraph() {
  return (
    <div className="space-y-4">
      <LoadingHeader />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

function NotFound() {
  return (
    <Error>
      <ErrorIcon>
        <IconMessageCircleQuestion />
      </ErrorIcon>
      <ErrorTitle>No conversations yet</ErrorTitle>
      <ErrorDescription>
        There aren’t any chats linked to this project. Start a new one to begin
        the discussion.
      </ErrorDescription>
    </Error>
  );
}

function UserMessage({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="user-message" className={cn(className)}>
      <div
        className="ml-auto max-w-lg w-fit px-4 py-2 bg-secondary rounded-2xl"
        {...props}
      />
    </div>
  );
}

function AssistantMessage({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="assistant-message"
      className={cn("space-y-12", className)}
      {...props}
    />
  );
}
