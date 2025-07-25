"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { validatedActionWithUser } from "@/lib/action-helpers";
import { createClientTwo } from "@/lib/supabase/client";

//import { schema } from "../shared";


const schema = z.array(
  z.object({
    name: z.string(),
    created_at: z.string().optional(),
  })
);

export async function deleteFolder(folderId: number) {
  const supabase = await createClientTwo();

  // Optionally delete related files first if needed

  const { error } = await supabase
  .from("folder")
  .delete()
  .eq("id", folderId);

  if (error) {
    console.error("Error deleting folder:", error);
    throw new Error("Failed to delete folder");
  }

  revalidatePath("/Data_source");
}

export async function getFolders() {
  const supabase = await createClientTwo();

  const { data, error } = await supabase
    .from("folder")
    .select(`
      id,
      name,
      created_at,
      file(count)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Extract count from the nested file object
  const formatted = data.map((folder: any) => ({
    ...folder,
    total_files: folder.file[0]?.count || 0,
  }));

  return formatted;
}

export const formAction = validatedActionWithUser(schema, async (body) => {
  console.log("Received Data", body);
  try {
    console.log("Creating SUPABASE CLIENT TO INTERACT WITH DB");
    const supabase = await createClientTwo();
    console.log("CREATED...");

    const { error: insertError } = await supabase
      .from("folder") 
      .upsert(body, { onConflict: "name" }); // Bulk upsert

    // if (insertError) {
    //   throw toSupabaseError(insertError);
    // }

    console.log("Revalidating...");
    revalidatePath("/department/structure"); // Update this if your path differs
    return { message: "Imported successfully." };
  } catch (err) {
    console.error(err);
    return { error: true, message: "Internal Error" };
  }
});
// Add this new function inside action.ts

export async function getFilesByFolder(folderId: number) {
  const supabase = await createClientTwo();

  const { data, error } = await supabase
    .from("file") // Assuming your files table is named 'file'
    .select("id, name, created_at") // Select the file properties you need
    .eq("folder_id", folderId) // Filter by the folder's ID
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching files by folder:", error);
    throw error;
  }

  return data;
}