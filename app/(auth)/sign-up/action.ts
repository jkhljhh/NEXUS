// Filename: action.tsx
// Path: @/app/(auth)/sign-up/
"use server";

import { SupabaseError, toSupabaseError } from "@/lib/supabase/error";
import { createClient } from "@/lib/supabase/server";
import { validatedAction } from "@/lib/action-helpers";

import { schema } from "./shared";

export const formAction = validatedAction(schema, async (data) => {
  try {
    const supabase = await createClient();

    const { error: err } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.name,
        },
      },
    });

    if (err) {
      throw toSupabaseError(err);
    }

    return { message: "Please check your email." };
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
