// Filename: shared.ts
// Path: @/app/(auth)/sign-in/
import { z } from "zod";

export const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type Schema = z.infer<typeof schema>;

export const defaultValues: Schema = {
  email: "",
  password: "",
};
