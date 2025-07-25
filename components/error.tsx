"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@tabler/icons-react";

function Error({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col border rounded-md py-12 px-4 justify-center items-center text-center",
        className,
      )}
      {...props}
    />
  );
}

function ErrorIcon({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("bg-secondary w-fit rounded-full p-4", className)}
      {...props}
    />
  );
}

function ErrorTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1 className={cn("mt-2 text-xl font-semibold", className)} {...props} />
  );
}

function ErrorDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("mt-1 text-muted-foreground text-sm max-w-sm", className)}
      {...props}
    />
  );
}

export { Error, ErrorIcon, ErrorTitle, ErrorDescription };
