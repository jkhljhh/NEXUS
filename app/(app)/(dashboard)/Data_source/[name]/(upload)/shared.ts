import { url } from "inspector";
import { z } from "zod";

export const schema = z.object({
  name: z.string(),
  url: z.string().optional(),
  file: z.any().optional(),
  user_id: z.string(),       // user ID from your users table
  user_name: z.string(),     // user name from your users table
  folder_id:z.string(),
  file_size:z.string(),
});
