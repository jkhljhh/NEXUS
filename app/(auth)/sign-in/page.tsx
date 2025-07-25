// Filename: page.tsx
// Path: @/app/(auth)/sign-in/
"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

import { Form } from "./form";

export default function SignInPage() {
  return (
    <div className={cn("flex flex-col gap-6")}>
      {/*  */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign in to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to sign in to your account
        </p>
      </div>
      {/*  */}
      <Form />
      {/*  */}
      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-primary font-semibold">
          Sign up
        </Link>
      </div>
      {/*  */}
    </div>
  );
}
