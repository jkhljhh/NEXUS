// Filename: shared.ts
// Path: @/app/(auth)/sign-up/
import { z } from "zod";

export const schema = z.object({
  name: z.string().max(100, "Name is too long"),
  email: z.string().email(),
  password: z.string().max(400, "Password is too long"),
});

export type Schema = z.infer<typeof schema>;

export const defaultValues: Schema = {
  name: "",
  email: "",
  password: "",
};
