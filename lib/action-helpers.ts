// Filename: action-helpers
// Path: @/lib/

import { z } from "zod";
import { createClient } from "./supabase/server";

export type ActionState = {
  error?: boolean;
  message: string;
};

export function validatedAction<S extends z.ZodType<any, any>>(
  schema: S,
  action: (data: z.infer<S>) => Promise<ActionState>,
) {
  return async (values: z.infer<S>): Promise<ActionState> => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      return {
        error: true,
        message: parsed.error.errors[0].message,
      };
    }

    return action(parsed.data);
  };
}

export function validatedActionWithUser<S extends z.ZodType<any, any>>(
  schema: S,
  action: (data: z.infer<S>) => Promise<ActionState>,
) {
  return async (values: z.infer<S>): Promise<ActionState> => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      return {
        error: true,
        message: parsed.error.errors[0].message,
      };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        error: true,
        message: "Unauthorized",
      };
    }

    return action(parsed.data);
  };
}
