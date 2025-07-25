"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState, useEffect, use ,useMemo} from "react";
import { toast } from "sonner"; // Assuming you have 'sonner' for toasts
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { IconMessageCircle } from "@tabler/icons-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createClient, createClientTwo } from "@/lib/supabase/client";
import { formAction, getFilesInFolder, deleteFile } from "./action";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/page-header";
import { IconEye, IconFiles, IconTrash, IconView360 } from "@tabler/icons-react";
import Link from "next/link";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const PageData = {
  title: "Files",
  description: "Files uploaded by you",
};

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  file: z.any().refine((f) => f?.length > 0, "File is required"),
});


type FormData = z.infer<typeof schema>;
function getUniqueFileName(originalName: string, existingNames: string[]): string {
  const lowerCaseExistingNames = existingNames.map(n => n.toLowerCase());

  // If the original name is already unique, just return it.
  if (!lowerCaseExistingNames.includes(originalName.toLowerCase())) {
    return originalName;
  }

  // Separate the name from the extension (e.g., ".pdf")
  const extIndex = originalName.lastIndexOf(".");
  const fileExtension = extIndex !== -1 ? originalName.slice(extIndex) : "";
  const nameWithoutExt = extIndex !== -1 ? originalName.slice(0, extIndex) : originalName;

  // Regex to find a suffix like "(12)" at the end of the name
  const suffixRegex = /\((\d+)\)$/;
  const match = nameWithoutExt.match(suffixRegex);

  let baseName;
  let currentCount;

  if (match) {
    // If the name already has a suffix like "nots(2)"
    // The base name will be "nots"
    baseName = nameWithoutExt.slice(0, match.index).trim();
    // The starting count will be 2 + 1 = 3
    currentCount = parseInt(match[1], 10) + 1;
  } else {
    // If the name is just "nots"
    baseName = nameWithoutExt.trim();
    currentCount = 1;
  }

  let newName;
  // Loop to find the next available number, e.g., (3), (4), etc.
  do {
    newName = `${baseName}(${currentCount})${fileExtension}`;
    currentCount++;
  } while (lowerCaseExistingNames.includes(newName.toLowerCase()));

  return newName;
}



export default function UploadPage({params,}: { params: Promise<{ name: string }>;}) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
 
  const [isSendingToChat, setIsSendingToChat] = useState(false);
  const [selectedFileIds, setSelectedFileIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<"copy" | "move" | null>(null);
  const [targetFolders, setTargetFolders] = useState<number[]>([]);

  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const { name } = use(params);
  const [sortColumn, setSortColumn] = useState<null | string>(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [fileSearchQuery, setFileSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");



  // State to store the current user's info
  const [currentUserInfo, setCurrentUserInfo] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  // New loading states for copy/move operations
  const [isCopying, setIsCopying] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false); // For bulk actions

  useEffect(() => {
    async function loadInitialData() {
      const supabase = createClientTwo();
      const {
        data: { user },
        error: userSessionError,
      } = await supabase.auth.getUser();

      if (userSessionError || !user) {
        console.error("Error fetching user session:", userSessionError);
        // Do not toast here, as it might be before login or during initial load
      } else if (user && user.email) {
        const { data: userInfo, error: userError } = await supabase
          .from("user")
          .select("user_id, name")
          .eq("email", user.email)
          .single();

        if (!userError && userInfo) {
          setCurrentUserInfo({
            userId: userInfo.user_id,
            userName: userInfo.name,
          });
        } else {
          console.error("Error fetching current user info:", userError);
          // Toast here if user is expected to be logged in but info missing
        }
      }

      const files = await getFilesInFolder(name);
      setFiles(files);

      const { data: folderData, error } = await supabase
        .from("folder")
        .select("id, name");
      if (!error && folderData) {
        setFolders(folderData);
      }
    }
    loadInitialData();
  }, [name, open]);

  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [copyTargetFolders, setCopyTargetFolders] = useState<string[]>([]);
  const [moveTargetFolder, setMoveTargetFolder] = useState<string>("");
  const [singleFileMoveDialogOpen, setSingleFileMoveDialogOpen] = useState(false);
  const [singleFileCopyDialogOpen, setSingleFileCopyDialogOpen] = useState(false);

const handleBulkAction = async () => {
  if (!currentUserInfo) {
    toast.error("Current user information is not available. Please log in.");
    return;
  }
  if (targetFolders.length === 0) {
    toast.error("Please select at least one target folder.");
    return;
  }

  setIsBulkProcessing(true);
  const actionType = bulkAction === "copy" ? "Copying" : "Moving";
  const toastId = toast.loading(`${actionType} selected files...`);

  try {
    const supabase = createClient();
    const targetFolderNames: string[] = [];

    if (bulkAction === "move") {
      // Move logic...
      if (targetFolders.length !== 1) {
        toast.error("Please select only one destination folder to move files.", { id: toastId });
        setIsBulkProcessing(false);
        return;
      }
      const targetFolderId = targetFolders[0];
      const { data: folderData } = await supabase.from("folder").select("name").eq("id", targetFolderId).single();
      if (folderData?.name) targetFolderNames.push(folderData.name);

      const { data: existingFiles } = await supabase.from("file").select("name").eq("folder_id", targetFolderId);
      let existingNames = existingFiles?.map((f) => f.name) ?? [];

      for (const fileId of selectedFileIds) {
        const { data: originalFile } = await supabase.from("file").select("name").eq("id", fileId).single();
        if (!originalFile) continue;
        const uniqueName = getUniqueFileName(originalFile.name, existingNames);
        await supabase.from("file").update({ folder_id: targetFolderId, name: uniqueName }).eq("id", fileId);
        if (uniqueName !== originalFile.name) {
          existingNames.push(uniqueName);
        }
      }
    } else if (bulkAction === "copy") {
      for (const fileId of selectedFileIds) {
        const { data: originalFile } = await supabase.from("file").select("*").eq("id", fileId).single();
        if (!originalFile) continue;

        for (const folderId of targetFolders) {
          const { data: folderData } = await supabase.from("folder").select("name").eq("id", folderId).single();
          if (folderData?.name && !targetFolderNames.includes(folderData.name)) {
            targetFolderNames.push(folderData.name);
          }

          const { data: existingFiles } = await supabase.from("file").select("name");
          const existingNames = existingFiles?.map((f) => f.name) ?? [];
          console.log("Existing name::",existingNames);
          const uniqueName = getUniqueFileName(originalFile.name, existingNames);
          console.log("uniqueName:",uniqueName);

          // --- DEBUGGING: Verify the names before inserting ---
          console.log({
            originalName: originalFile.name,
            existingNamesInFolder: existingNames,
            generatedUniqueName: uniqueName,
          });
          // ----------------------------------------------------
          
          const { error: insertError } = await supabase.from("file").insert({
            name: uniqueName,
            url: originalFile.url,
            file_size: originalFile.file_size,
            folder_id: folderId,
            uploaded_by_user_id: currentUserInfo.userId,
            uploaded_by_user_name: currentUserInfo.userName,
            created_at: new Date().toISOString(),
          });

          if (insertError) {
            console.error("Database insert failed:", insertError);
          } else {
            // Add the new name to our list for the next file in the same operation
            existingNames.push(uniqueName);
          }
        }
      }
    }

    // Final toast message and UI refresh
    if (targetFolderNames.length > 0) {
      const actionVerb = bulkAction === "copy" ? "copied to" : "moved to";
      toast.success(`Files ${actionVerb}: ${targetFolderNames.join(", ")}`, { id: toastId });
    } else {
      toast.success(`${actionType} successful!`, { id: toastId });
    }

    setBulkAction(null);
    setTargetFolders([]);
    setSelectedFileIds([]);
    const updated = await getFilesInFolder(name);
    setFiles(updated);
  } catch (err) {
    toast.error(`${actionType} failed.`, { id: toastId });
    console.error("An error occurred in handleBulkAction:", err);
  } finally {
    setIsBulkProcessing(false);
  }
};
// Add this handler function inside your component
 const router = useRouter();
const handleBulkSendToChat = () => {
  
  if (selectedFileIds.length === 0) {
    toast.error("No files selected.");
    return;
  }

  setIsSendingToChat(true);
  
  // Find the names of the selected files
  const selectedFileNames = files
    .filter((file) => selectedFileIds.includes(file.id))
    .map((file) => file.name);

  // Store the file names in localStorage for the chatbox to pick up
  localStorage.setItem(
    'chat-selected-files', 
    JSON.stringify(selectedFileNames)
  );
  
  toast.success(`${selectedFileNames.length} file(s) sent to chat!`);

  // Redirect to the chat page (assuming the path is '/chat')
  router.push("/");

  setIsSendingToChat(false);
};

const onSubmit = async (data: FormData) => {
  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }

  // The duplicate getUniqueFileName function that was here has been REMOVED.

  if (!currentUserInfo) {
    toast.error("Current user information is not available. Please log in.");
    return;
  }

  startTransition(async () => {
    const uploadToastId = toast.loading("Uploading file...");
    const supabase = createClient();
    const file = data.file[0];
    const originalInputName = data.name || file.name;

    try {
      const { data: folderData, error: folderError } = await supabase
        .from("folder")
        .select("id")
        .eq("name", name)
        .single();

      if (!folderData || folderError) {
        throw new Error(folderError?.message || "Folder not found");
      }

      const folderId = folderData.id;

      const { data: existingFiles } = await supabase
        .from("file")
        .select("name")
        .eq("folder_id", folderId);

      const existingNames = existingFiles?.map(f => f.name) ?? [];

      // This will now call the correct, top-level function
      const uniqueName = getUniqueFileName(originalInputName, existingNames);
      const filePath = `folder-${name}/${uniqueName}`;

      if (uniqueName !== originalInputName) {
        toast.info(`Duplicate found. File renamed to "${uniqueName}"`);
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("pdf")
        .upload(filePath, file);

      if (uploadError || !uploadData) {
        throw new Error(uploadError?.message || "Upload failed");
      }

      const publicUrl = supabase.storage
        .from("pdf")
        .getPublicUrl(uploadData.path).data.publicUrl;

      const readableFileSize = formatFileSize(file.size);
      const result = await formAction({
        name: uniqueName,
        url: publicUrl,
        folder_id: folderId.toString(),
        file_size: readableFileSize,
        uploaded_by_user_id: currentUserInfo.userId,
        uploaded_by_user_name: currentUserInfo.userName,
      });

      if ("error" in result && result.error) {
        throw new Error(result.message || "Metadata error");
      }

      toast.success("File uploaded successfully", { id: uploadToastId });
      setOpen(false);
      reset();
      const updatedFiles = await getFilesInFolder(name);
      setFiles(updatedFiles);
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during upload.", { id: uploadToastId });
      console.error("Upload error:", err);
    }
  });
};

const filteredAndSortedFiles = useMemo(() => {
  let filtered = files;
  if (fileSearchQuery.trim()) {
    filtered = filtered.filter(f =>
      f.name.toLowerCase().includes(fileSearchQuery.trim().toLowerCase())
    );
  }
  if (userSearchQuery.trim()) {
    filtered = filtered.filter(f =>
      f.uploaded_by_user_name &&
      f.uploaded_by_user_name.toLowerCase().includes(userSearchQuery.trim().toLowerCase())
    );
  }
  if (sortColumn) {
    filtered = [...filtered].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];
      // Sorting logic as before...
      if (sortColumn === "created_at") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      if (sortColumn === "file_size") {
        const getBytes = (size: string) => {
          if (typeof size !== "string") return 0;
          if (size.endsWith("KB")) return parseFloat(size) * 1024;
          if (size.endsWith("MB")) return parseFloat(size) * 1024 * 1024;
          if (size.endsWith("B"))  return parseFloat(size);
          return 0;
        };
        aValue = getBytes(aValue);
        bValue = getBytes(bValue);
      }
      if (typeof aValue === "string" && typeof bValue === "string") {
        const result = aValue.localeCompare(bValue, undefined, { sensitivity: "base" });
        return sortDirection === "asc" ? result : -result;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        const result = aValue.getTime() - bValue.getTime();
        return sortDirection === "asc" ? result : -result;
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        const result = aValue - bValue;
        return sortDirection === "asc" ? result : -result;
      }
      return 0;
    });
  }
  return filtered;
}, [files, fileSearchQuery, userSearchQuery, sortColumn, sortDirection]);


  

  return (
    <div className="p-6 space-y-6">
      <PageHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
          <div className="flex items-center gap-3">
            <IconFiles />
            <div className="flex flex-col">
              <PageHeaderTitle>{PageData.title}</PageHeaderTitle>
              <PageHeaderDescription>
                {PageData.description}
              </PageHeaderDescription>
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="whitespace-nowrap">Upload</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  {...register("file")}
                />
                {typeof formState.errors.file?.message === "string" && (
                  <p className="text-sm text-red-500">
                    {formState.errors.file.message}
                  </p>
                )}
                {typeof formState.errors.name?.message === "string" && (
                  <p className="text-sm text-red-500">
                    {formState.errors.name.message}
                  </p>
                )}

                <Input placeholder="Enter file name" {...register("name")} />
                {formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {formState.errors.name.message}
                  </p>
                )}
                <DialogFooter className="pt-2">
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Uploading..." : "Upload"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>
      {selectedFileIds.length > 0 && (
        <div className="flex gap-4 my-4">
          <Button onClick={() => setBulkAction("copy")}>Copy Selected</Button>
          <Button onClick={() => setBulkAction("move")}>Move Selected</Button>
           <Button 
      onClick={handleBulkSendToChat} 
      disabled={isSendingToChat}
      variant="outline"
    >
      {isSendingToChat ? "Sending..." : "Send to Chat"}
    </Button>
        </div>
      )}

      {files.length > 0 && (
        <div className="overflow-x-auto">
       <div className="flex gap-3 w-full max-w-2xl mb-4">
  <Input
    type="text"
    placeholder="Search by file name…"
    value={fileSearchQuery}
    onChange={e => setFileSearchQuery(e.target.value)}
    className="flex-1"
  />
  <Input
    type="text"
    placeholder="Search by user name…"
    value={userSearchQuery}
    onChange={e => setUserSearchQuery(e.target.value)}
    className="flex-1"
  />
</div>


          <table className="w-full table-auto text-left text-sm text-gray-900 border border-gray-200">
          <thead className="bg-muted">
  <tr>
    <th className="p-3">
      {/* ...checkbox... */}
    </th>
    {/* Name column */}
    <th
      className="p-3 cursor-pointer select-none"
      onClick={() => {
        if (sortColumn === "name") {
          setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
          setSortColumn("name");
          setSortDirection("asc");
        }
      }}
    >
      Name{" "}
      {sortColumn === "name" && (
        <span>{sortDirection === "asc" ? "▲" : "▼"}</span>
      )}
    </th>
    {/* Modified column */}
    <th
      className="p-3 cursor-pointer select-none"
      onClick={() => {
        if (sortColumn === "created_at") {
          setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
          setSortColumn("created_at");
          setSortDirection("asc");
        }
      }}
    >
      Modified{" "}
      {sortColumn === "created_at" && (
        <span>{sortDirection === "asc" ? "▲" : "▼"}</span>
      )}
    </th>
    <th className="p-3">Modified By</th>
    {/* Size column */}
    <th
      className="p-3 cursor-pointer select-none"
      onClick={() => {
        if (sortColumn === "file_size") {
          setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
          setSortColumn("file_size");
          setSortDirection("asc");
        }
      }}
    >
      Size{" "}
      {sortColumn === "file_size" && (
        <span>{sortDirection === "asc" ? "▲" : "▼"}</span>
      )}
    </th>
    <th className="p-3">Action</th>
  </tr>
</thead>


            <tbody>
              
              {filteredAndSortedFiles.map((file) => (
                
                <tr key={file.id}>
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedFileIds.includes(file.id)}
                      onChange={() => {
                        setSelectedFileIds((prev) =>
                          prev.includes(file.id)
                            ? prev.filter((id) => id !== file.id)
                            : [...prev, file.id]
                        );
                      }}
                      className="accent-primary"
                    />
                  </td>
                 <td className="p-3 font-medium">
                  <Link
                    href={`/Data_source/PDFViewer/${file.name}?url=${encodeURIComponent(file.url)}`}
                    className="text-black-600 hover:underline font-semibold"
                  >
                    {file.name}
                  </Link>
                </td>
                
                {/* <td className="p-3 text-sm">
                    {filextention}
                  </td> */}


                  <td className="p-3 text-sm">
                    {new Date(file.created_at).toLocaleString()}
                  </td>
                  <td className="p-3">
                    {file.uploaded_by_user_name}
                    <br className="sm:hidden" />
                    <span className="text-xs text-muted-foreground">
                      (ID: {file.uploaded_by_user_id})
                    </span>
                  </td>
                  <td className="p-3 text-sm">{file.file_size}</td>

                  <td className="p-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-6 h-6 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* View */}
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/Data_source/PDFViewer/${file.id}?url=${encodeURIComponent(file.url)}`}
                            className="text-sm"
                          >
                            <IconEye/>
                            View
                          </Link>
                        </DropdownMenuItem>

                        {/* Delete */}
<DropdownMenuItem
  onClick={async () => {
    toast.warning("Are you sure you want to delete this file?", {
      // Position the toast at the top center for high visibility
      position: "top-center",
      action: {
        label: "YES", // Make the action more explicit
        onClick: async () => {
          const deleteToastId = toast.loading("Deleting file...", {
            position: "top-center", // Keep loading toast consistent
          });
          const filePath = new URL(file.url).pathname.replace(
            "/storage/v1/object/public/pdf/",
            ""
          );

          try {
            await deleteFile(file.id, filePath, name);
            toast.success("File deleted successfully", {
              id: deleteToastId,
              position: "top-center", // Keep success toast consistent
            });
            const updated = await getFilesInFolder(name);
            setFiles(updated);
          } catch (err) {
            toast.error("Failed to delete file", {
              id: deleteToastId,
              position: "top-center", // Keep error toast consistent
            });
            console.error(err);
          }
        },
      },
       // Give more time for the user to react
      description: "This action cannot be undone and will permanently remove the file.",
      // Custom styling for a red background (requires global CSS or Tailwind config)
      // This part assumes you have 'sonner' CSS variables or Tailwind configured
      // You might need to add a custom class or override CSS variables.
      // Example using `style` for direct application (less ideal for complex styling):
      style: {
        backgroundColor: '#fee2e2', // Light red background
        color: '#b91c1c', // Dark red text
        borderColor: '#ef4444', // Red border
      },
      // Or if you use Tailwind, you might define custom classes in your `tailwind.config.js`
      // and apply them via a `className` prop if `sonner` supports it for the toast itself.
      // For a more robust solution, check sonner's theming or custom component options.
    });
  }}
  className="text-red-600"
>
  <IconTrash/>
  Delete
  
</DropdownMenuItem>
                        {/* Copy Dialog */}
                        <DropdownMenuItem asChild>
                          <Dialog open={singleFileCopyDialogOpen} onOpenChange={setSingleFileCopyDialogOpen}>
                            <DialogTrigger asChild>
                              {/* <Button variant="ghost" className="w-full text-left p-0 text-purple-600"></Button> */}
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Select Folders to Copy</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {folders.map((folder) => (
                                  <label
                                    key={folder.id}
                                    className="flex items-center gap-2"
                                  >
                                    <input
                                      type="checkbox"
                                      value={folder.name}
                                      checked={copyTargetFolders.includes(
                                        folder.name
                                      )}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setCopyTargetFolders((prev) =>
                                          prev.includes(val)
                                            ? prev.filter((f) => f !== val)
                                            : [...prev, val]
                                        );
                                      }}
                                      className="accent-primary"
                                    />
                                    {folder.name}
                                  </label>
                                ))}
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={async () => {
                                    if (!currentUserInfo) {
                                      toast.error("Current user information is not available. Please log in.");
                                      return;
                                    }
                                    if (copyTargetFolders.length === 0) {
                                        toast.error("Please select at least one target folder.");
                                        return;
                                    }

                                    setIsCopying(true); // Start loading
                                    const copyToastId = toast.loading("Copying file...");

                                    try {
                                      const response = await fetch(file.url);
                                      if (!response.ok)
                                        throw new Error("Failed to fetch file.");
                                      const blob = await response.blob();
                                      const fileName = file.name || `file-${Date.now()}.pdf`;
                                      const ext = fileName.split(".").pop();
                                      const baseName = fileName.substring(0, fileName.lastIndexOf("."));

                                      const supabase = createClient();

                                      for (const folderName of copyTargetFolders) {
                                        const newPath = `${folderName}/${baseName}-${Date.now()}.${ext}`;

                                        const { error: uploadError } =
                                          await supabase.storage
                                            .from("pdf")
                                            .upload(newPath, blob, {
                                              contentType: blob.type,
                                              upsert: false,
                                            });

                                        if (uploadError) throw uploadError;

                                        const publicUrl = supabase.storage
                                          .from("pdf")
                                          .getPublicUrl(newPath).data
                                          .publicUrl;

                                        const {
                                          data: folderData,
                                          error: folderError,
                                        } = await supabase
                                          .from("folder")
                                          .select("id")
                                          .eq("name", folderName)
                                          .single();

                                        if (folderError || !folderData)
                                          throw new Error("Folder not found");

                                        const { error: insertError } =
                                          await supabase.from("file").insert({
                                            name: file.name,
                                            url: publicUrl,
                                            folder_id: folderData.id,
                                            uploaded_by_user_id:
                                              currentUserInfo.userId,
                                            uploaded_by_user_name:
                                              currentUserInfo.userName,
                                            file_size: file.file_size,
                                            created_at: new Date().toISOString(),
                                          });

                                        if (insertError) throw insertError;
                                      }

                                      toast.success("File copied successfully", { id: copyToastId });
                                      setSingleFileCopyDialogOpen(false); // Close dialog
                                      setCopyTargetFolders([]); // Clear selected folders
                                      const updated = await getFilesInFolder(name);
                                      setFiles(updated);
                                    } catch (err: any) {
                                      toast.error("Failed to copy file", { id: copyToastId });
                                      console.error("Copy Error:", JSON.stringify(err, null, 2));
                                    } finally {
                                      setIsCopying(false); // End loading
                                    }
                                  }}
                                  disabled={isCopying} // Disable button during loading
                                >
                                  {isCopying ? "Copying..." : "Copy"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </DropdownMenuItem>

                        {/* Move Dialog */}
                        <DropdownMenuItem asChild>
                          <Dialog open={singleFileMoveDialogOpen} onOpenChange={setSingleFileMoveDialogOpen}>
                            <DialogTrigger asChild>
                              {/* <Button variant="ghost" className="w-full text-left p-0 text-green-600">Move</Button> */}
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Select Folder to Move</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-2">
                                <select
                                  value={moveTargetFolder}
                                  onChange={(e) =>
                                    setMoveTargetFolder(e.target.value)
                                  }
                                  className="w-full border rounded p-2"
                                >
                                  <option value="">Select folder</option>
                                  {folders.map((folder) => (
                                    <option key={folder.id} value={folder.name}>
                                      {folder.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={async () => {
                                    if (!moveTargetFolder) {
                                      toast.error("Please select a folder to move.");
                                      return;
                                    }

                                    if (!currentUserInfo) {
                                      toast.error("Current user information is not available. Please log in.");
                                      return;
                                    }

                                    setIsMoving(true); // Start loading
                                    const moveToastId = toast.loading("Moving file...");

                                    const supabase = createClient();
                                    const { moveFile } = await import("./action");

                                    try {
                                      const oldFilePath = new URL(file.url).pathname.replace(
                                        "/storage/v1/object/public/pdf/",
                                        ""
                                      );

                                      const { data: targetFolderData, error: targetFolderError } = await supabase
                                        .from("folder")
                                        .select("id")
                                        .eq("name", moveTargetFolder)
                                        .single();

                                      if (targetFolderError || !targetFolderData) {
                                        throw new Error("Target folder not found.");
                                      }

                                      await moveFile(
                                        file.id,
                                        oldFilePath,
                                        moveTargetFolder,
                                        targetFolderData.id,
                                        currentUserInfo.userId,
                                        currentUserInfo.userName
                                      );

                                      toast.success(`File moved to ${moveTargetFolder}`, { id: moveToastId });
                                      setSingleFileMoveDialogOpen(false); // Close dialog
                                      setMoveTargetFolder("");
                                      const updated = await getFilesInFolder(name);
                                      setFiles(updated);
                                    } catch (err: any) {
                                      toast.error("Failed to move file", { id: moveToastId });
                                      console.error("Move Error:", err);
                                    } finally {
                                      setIsMoving(false); // End loading
                                    }
                                  }}
                                  disabled={isMoving} // Disable button during loading
                                >
                                  {isMoving ? "Moving..." : "Move"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </DropdownMenuItem>
                        <DropdownMenuItem
    onClick={() => {
      // Store the single file name in localStorage
      localStorage.setItem('chat-selected-files', JSON.stringify([file.name]));
      toast.success(`"${file.name}" sent to chat!`);
      // Redirect to the chat page
      router.push("/"); 
    }}
    className="cursor-pointer"
  >
    <IconMessageCircle className="mr-2 h-4 w-4" />
    <span>Send to Chat</span>
  </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog
        open={!!bulkAction}
        onOpenChange={() => {
          setBulkAction(null);
          setTargetFolders([]);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkAction === "copy" ? "Copy Files" : "Move Files"}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {folders.map((folder) => (
              <label key={folder.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={folder.id}
                  checked={targetFolders.includes(Number(folder.id))}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setTargetFolders((prev) =>
                      prev.includes(val)
                        ? prev.filter((id) => id !== val)
                        : [...prev, val]
                    );
                  }}
                  className="accent-primary"
                />
                {folder.name}
              </label>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={handleBulkAction} disabled={isBulkProcessing}>
              {isBulkProcessing ? (bulkAction === "copy" ? "Copying..." : "Moving...") : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}