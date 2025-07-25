// File: components/folder-list-modal.tsx
"use client";

import { useState } from "react";
import {
  IconFolder,
  IconLoader2,
  IconX,
  IconArrowLeft,
  IconFile,
} from "@tabler/icons-react";

// Define the shape of Folder and File objects
interface Folder {
  id: number;
  name: string;
  created_at: string;
  total_files: number;
}

interface File {
  id: number;
  name: string;
  created_at: string;
}

interface FolderListModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFolders: Folder[];
  isLoadingFolders: boolean;
  onFileSelect: (fileName: string) => void; // Callback for when a file is selected
}

export function FolderListModal({
  isOpen,
  onClose,
  initialFolders,
  isLoadingFolders,
  onFileSelect,
}: FolderListModalProps) {
  const [view, setView] = useState<"folders" | "files">("folders");
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  const handleFolderClick = async (folder: Folder) => {
    setSelectedFolder(folder);
    setView("files");
    setIsLoadingFiles(true);
    try {
      // IMPORTANT: Adjust this URL if your "Data Storage" app runs on a different port
      const response = await fetch(`http://localhost:3000/Data_source/api/files/${folder.id}`);
      if (!response.ok) throw new Error("Failed to fetch files");
      const data: File[] = await response.json();
      setFiles(data);
    } catch (error) {
      console.error(error);
      setFiles([]); // Clear files on error
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleBackClick = () => {
    setView("folders");
    setSelectedFolder(null);
    setFiles([]);
  };
  
  const handleFileClick = (file: File) => {
    onFileSelect(file.name); // Pass the selected file name back to the parent
    onClose(); // Close the modal
  };

  // When the modal is closed, reset its internal state
  const handleClose = () => {
    onClose();
    setTimeout(() => {
        handleBackClick();
    }, 300); // Reset after close animation
  };

  if (!isOpen) {
    return null;
  }

  const renderContent = () => {
    if (view === "files") {
      return (
        <>
          <div className="flex items-center gap-3 border-b pb-3">
            <button onClick={handleBackClick} className="rounded-full p-1 hover:bg-gray-100">
              <IconArrowLeft className="size-5" />
            </button>
            <h2 className="truncate text-lg font-semibold" title={selectedFolder?.name}>
              Files in {selectedFolder?.name}
            </h2>
          </div>
          <div className="mt-4 max-h-96 overflow-y-auto">
            {isLoadingFiles ? (
              <div className="flex justify-center py-10"><IconLoader2 className="size-8 animate-spin text-gray-500" /></div>
            ) : files.length > 0 ? (
              <ul className="space-y-1">
                {files.map((file) => (
                  <li key={file.id} onClick={() => handleFileClick(file)} className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-gray-100">
                    <IconFile className="size-5 flex-shrink-0 text-gray-600" />
                    <span className="flex-grow truncate text-sm">{file.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-10 text-center text-sm text-gray-500">No files in this folder.</p>
            )}
          </div>
        </>
      );
    }

    // Default view is "folders"
    return (
      <>
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg font-semibold">Stored Folders</h2>
          <button onClick={handleClose} className="rounded-full p-1 hover:bg-gray-100">
            <IconX className="size-5" />
          </button>
        </div>
        <div className="mt-4 max-h-96 overflow-y-auto">
          {isLoadingFolders ? (
            <div className="flex justify-center py-10"><IconLoader2 className="size-8 animate-spin text-gray-500" /></div>
          ) : initialFolders.length > 0 ? (
            <ul className="space-y-1">
              {initialFolders.map((folder) => (
                <li key={folder.id} onClick={() => handleFolderClick(folder)} className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-gray-100">
                  <IconFolder className="size-5 flex-shrink-0 text-gray-600" />
                  <span className="flex-grow truncate text-sm">{folder.name}</span>
                  <span className="text-xs text-gray-400">{folder.total_files} files</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-10 text-center text-sm text-gray-500">No folders found.</p>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
        {renderContent()}
      </div>
    </div>
  );
}
