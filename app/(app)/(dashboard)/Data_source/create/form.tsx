"use client";

import React, { useState, useTransition } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"; // Assuming you have a Tabs component

// Schema for creating an empty folder
const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
});

// Schema for uploading a folder
const uploadFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
});

type CreateFolderValues = z.infer<typeof createFolderSchema>;
type UploadFolderValues = z.infer<typeof uploadFolderSchema>;

type FormProps = {
  id: number;
  onUpdate: () => void;
};

export function Form({ id, onUpdate }: FormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [filesToUpload, setFilesToUpload] = useState<FileList | null>(null);

  const createForm = useForm<CreateFolderValues>({
    resolver: zodResolver(createFolderSchema),
  });

  const uploadForm = useForm<UploadFolderValues>({
    resolver: zodResolver(uploadFolderSchema),
  });

  // Handler for creating an empty folder
  const onCreateSubmit = async (data: CreateFolderValues) => {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.from("folder").insert({
        name: data.name,
        created_at: new Date().toISOString(),
      });

      if (error) {
        toast.error("Failed to create folder. It might already exist.");
      } else {
        toast.success("Folder created successfully");
        setOpen(false);
        createForm.reset();
        onUpdate();
      }
    });
  };

  // Handler for uploading a folder with files
const onUploadSubmit = async (data: UploadFolderValues) => {
  if (!filesToUpload || filesToUpload.length === 0) {
    toast.error("Please select a folder to upload.");
    return;
  }

  startTransition(async () => {
    const supabase = createClient();
    
    // 1. Get the current user's information
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("You must be logged in to upload files.");
      return;
    }

    const folderName = data.name;
    const filesArray = Array.from(filesToUpload);
    let successfulUploads = 0;

    // Create the folder record in the database
    const { data: folderData, error: folderError } = await supabase
      .from("folder")
      .insert({
        name: folderName,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (folderError) {
      toast.error("Failed to create folder. It might already exist.");
      return;
    }

    toast.info(`Creating folder... Now uploading ${filesArray.length} files.`);

    // Loop through each file to upload and create its DB record
    for (const file of filesArray) {
      const filePath = `${folderName}/${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("pdf")
        .upload(filePath, file);

      if (uploadError) {
        console.error(`Upload failed for ${file.name}:`, uploadError.message);
        continue; 
      }

      const { data: urlData } = supabase.storage
        .from("pdf")
        .getPublicUrl(filePath);
      
      const publicUrl = urlData.publicUrl;

      // 2. Create the file record, now including user details
      const { error: insertError } = await supabase.from("file").insert({
        name: file.name,
        url: publicUrl,
        folder_id: folderData.id,
        file_size: `${(file.size / 1024).toFixed(2)} KB`,
        uploaded_by_user_id: user.id,
        uploaded_by_user_name: user.user_metadata?.full_name || user.email, // Fallback to email if name is not set
      });

      if (insertError) {
        console.error(`DB insert failed for ${file.name}:`, insertError.message);
      } else {
        successfulUploads++;
      }
    }

    // Report the final result
    if (successfulUploads === filesArray.length) {
      toast.success(
        `Folder "${folderName}" and all ${successfulUploads} files uploaded successfully.`
      );
    } else {
      toast.warning(
        `Upload complete. ${successfulUploads} of ${filesArray.length} files were successful.`
      );
    }
    
    setOpen(false);
    uploadForm.reset();
    setFilesToUpload(null);
    onUpdate();
  });
};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Folder</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Folder</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Empty</TabsTrigger>
            <TabsTrigger value="upload">Upload Folder</TabsTrigger>
          </TabsList>
          
          {/* Tab for creating an empty folder */}
          <TabsContent value="create">
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className="space-y-4 mt-4"
            >
              <Input
                placeholder="New folder name"
                {...createForm.register("name")}
              />
              {createForm.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {createForm.formState.errors.name.message}
                </p>
              )}
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* Tab for uploading a folder */}
          <TabsContent value="upload">
            <form
              onSubmit={uploadForm.handleSubmit(onUploadSubmit)}
              className="space-y-4 mt-4"
            >
              <Input
                placeholder="Enter folder name"
                {...uploadForm.register("name")}
              />
              {uploadForm.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {uploadForm.formState.errors.name.message}
                </p>
              )}
              <div>
                <label htmlFor="folder-upload" className="text-sm font-medium">
                  Select Folder
                </label>
                <Input
                  id="folder-upload"
                  type="file"
                  onChange={(e) => setFilesToUpload(e.target.files)}
                  // @ts-ignore
                  webkitdirectory="true"
                  // @ts-ignore 
                  directory="true"
                />
                 {filesToUpload && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {filesToUpload.length} files selected.
                  </p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Uploading..." : "Upload"}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}