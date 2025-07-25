// Filename: action.tsx
// Path: @/app/(auth)/sign-in/
"use server";

import { revalidatePath } from "next/cache";

import { SupabaseError, toSupabaseError } from "@/lib/supabase/error";
import { createClient } from "@/lib/supabase/server";
import { validatedAction } from "@/lib/action-helpers";

import { schema } from "./shared";

export const formAction = validatedAction(schema, async (body) => {
  try {
    const supabase = await createClient();

    const { error: err } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (err) {
      throw toSupabaseError(err);
    }

    revalidatePath("/", "layout");
    return { message: "Signed in successfully." };
  } catch (err) {
    if (err instanceof SupabaseError) {
      console.error("SupabaseError", err.message);
      if (err.status !== 500) {
        return { error: true, message: err.message };
      }
    }
    console.error(err);
    return { error: true, message: "Internal Error" };
  }
});
