// action.ts
"use server";

import { createClientTwo } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

// Assuming you have a way to get the current user in server actions
// For demonstration, let's create a placeholder function
async function getCurrentUserServer() {
  const supabase = await createClientTwo();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("User not authenticated for server action.");
  }

  // Fetch user details from your 'user' table
  const { data: userInfo, error: userInfoError } = await supabase
    .from("user")
    .select("user_id, name")
    .eq("email", user.email)
    .single();

  if (userInfoError || !userInfo) {
    throw new Error("User details not found in database.");
  }

  return { userId: userInfo.user_id, userName: userInfo.name };
}

interface FormActionParams {
  name: string;
  url: string;
  folder_id: string;
  file_size: string;
  uploaded_by_user_id: string; // Add this
  uploaded_by_user_name: string; // Add this
}

export async function formAction(params: FormActionParams) {
  console.log("params::",params);
  const supabase = await createClientTwo();
  const { name, url, folder_id, file_size, uploaded_by_user_id, uploaded_by_user_name } = params;

  try {
    const { data, error } = await supabase.from("file").insert({
      name,
      url,
      folder_id: parseInt(folder_id),
      file_size,
      uploaded_by_user_id, // Use the provided user ID
      uploaded_by_user_name, // Use the provided user name
    });

    if (error) {
      console.error("Error inserting file metadata:", error);
      return { error: true, message: error.message };
    }

    revalidatePath("/Data_source/Files/[name]");
    return { success: true, data };
  } catch (err: any) {
    console.error("Unhandled error in formAction:", err);
    return { error: true, message: err.message || "An unexpected error occurred." };
  }
}

export async function getFilesInFolder(folderName: string, onlyNames = false) {
  const supabase = await createClientTwo();

  const { data: folderData, error: folderError } = await supabase
    .from("folder")
    .select("id")
    .eq("name", folderName)
    .single();

  if (folderError || !folderData) {
    console.error("Error fetching folder ID:", folderError);
    return [];
  }

  const query = supabase
    .from("file")
    .select(onlyNames ? "name" : "*")
    .eq("folder_id", folderData.id);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching files:", error);
    return [];
  }

  return data;
}


export async function deleteFile(
  fileId: number,
  filePath: string,
  folderName: string
) {
  const supabase = await createClientTwo();

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from("pdf")
    .remove([filePath]);

  if (storageError) {
    console.error("Error deleting file from storage:", storageError);
    throw new Error("Failed to delete file from storage.");
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from("file")
    .delete()
    .eq("id", fileId);

  if (dbError) {
    console.error("Error deleting file from database:", dbError);
    throw new Error("Failed to delete file record from database.");
  }

  revalidatePath("/Data_source/Files/[name]");
  return { success: true };
}

export async function moveFile(
  fileId: number,
  oldFilePath: string,
  targetFolderName: string,
  targetFolderId: number, // Pass folder ID directly for clarity
 
  uploadedByUserId: string, // New parameter
  uploadedByUserName: string // New parameter
) {
  const supabase =await  createClientTwo();

  try {
    // 1. Get the original file details from the database
    const { data: originalFile, error: fetchError } = await supabase
      .from("file")
      .select("*")
      .eq("id", fileId)
      .single();

    if (fetchError || !originalFile) {
      throw new Error("Original file not found.");
    }

    // 2. Download the file as a blob
    const { data: fileBlobData, error: downloadError } = await (await supabase).storage
      .from("pdf")
      .download(oldFilePath);

    if (downloadError || !fileBlobData) {
      throw new Error("Failed to download original file.");
    }

    // 3. Construct new path
    const originalFileName = originalFile.name || `file-${Date.now()}.pdf`;
    const ext = originalFileName.split(".").pop();
    const baseName = originalFileName.substring(0, originalFileName.lastIndexOf("."));
    const newPath = `${targetFolderName}/${baseName}-${Date.now()}.${ext}`;

    // 4. Upload the file to the new path
    const { error: uploadError } = await (await supabase).storage
      .from("pdf")
      .upload(newPath, fileBlobData, {
        contentType: originalFile.file_type || "application/octet-stream", // Use original type or default
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const publicUrl = await (await supabase).storage
      .from("pdf")
      .getPublicUrl(newPath).data.publicUrl;

    // 5. Update the database record with new folder_id and URL, and current uploader info
    const { error: updateError } = await (await supabase)
      .from("file")
      .update({
        folder_id: targetFolderId,
        url: publicUrl,
        uploaded_by_user_id: uploadedByUserId, // Set to the user performing the move
        uploaded_by_user_name: uploadedByUserName, // Set to the user performing the move
        created_at: new Date().toISOString(), // Update modified date to now
      })
      .eq("id", fileId);

    if (updateError) {
      throw updateError;
    }

    // 6. Delete the old file from storage (only if the DB update was successful)
    const { error: removeOldError } = await (await supabase).storage
      .from("pdf")
      .remove([oldFilePath]);

    if (removeOldError) {
      console.warn("Could not remove old file from storage:", removeOldError); // Log, but don't fail the move
    }

    revalidatePath("/Data_source/Files/[name]");
    revalidatePath(`/Data_source/Files/${targetFolderName}`); // Revalidate the new folder's path
    return { success: true };
  } catch (err: any) {
    console.error("Error moving file:", err);
    throw new Error(err.message || "Failed to move file.");
  }
}