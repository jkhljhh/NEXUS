"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  Error,
  ErrorDescription,
  ErrorIcon,
  ErrorTitle,
} from "@/components/error";
import { IconMessageCircleQuestion } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export function ListChats() {
  const chats = useQuery(api.chat.getAll);
  if (chats === undefined) return <Loading />;
  if (chats.length == 0) return <NotFound />;

  return (
    <div className="flex flex-col divide-y">
      {chats?.map((item) => (
        <Link key={item._id} href={`/c/${item._id}`} className="py-4">
          <h4 className="text-sm capitalize font-medium">{item.title}</h4>
          <p className="text-sm truncate">{item.description}</p>
        </Link>
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
