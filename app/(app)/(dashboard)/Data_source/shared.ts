import { z } from "zod";

export const schema = z.object({
  name: z.string(),
  created_at:z.string().optional(),
});