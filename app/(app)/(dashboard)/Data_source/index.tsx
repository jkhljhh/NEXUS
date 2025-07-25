"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  IconFolderUp,
  IconDots,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";

import { createClient } from "@/lib/supabase/client"; // Use your correct client import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define the shape of a single folder
type Folder = {
  id: number;
  name: string;
  created_at: string;
  total_files: number;
};

// 1. Define the props this component accepts, including selection logic
type FolderRowProps = {
  folder: Folder;
  isSelected: boolean;
  onSelect: (isChecked: boolean) => void;
  onUpdate: () => void;
};

export function FolderRow({ folder, isSelected, onSelect, onUpdate }: FolderRowProps) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    const supabase = createClient();

    // Check if the folder has files
    const { data: files, error: fetchError } = await supabase
      .from("file")
      .select("id")
      .eq("folder_id", folder.id); // Use folder.id

    if (fetchError) {
      toast.error("Error checking folder contents.");
      return;
    }

    if (files && files.length > 0) {
      toast.error("This folder contains files. Please delete all files first.");
      return;
    }

    const confirmDelete = window.confirm(
      "This folder is empty. Are you sure you want to delete it?"
    );

    if (!confirmDelete) return;

    // Proceed to delete
    const { error: deleteError } = await supabase
      .from("folder")
      .delete()
      .eq("id", folder.id); // Use folder.id

    if (deleteError) {
      toast.error("Failed to delete folder.");
    } else {
      toast.success("Folder deleted successfully.");
      onUpdate(); // Refresh the list
    }
  };

  const handleRename = async () => {
    if (!newName.trim() || newName === folder.name) {
      setEditing(false);
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("folder")
        .update({ name: newName })
        .eq("id", folder.id); // Use folder.id

      if (error) {
        toast.error("Rename failed.");
      } else {
        toast.success("Folder renamed successfully.");
        setEditing(false);
        onUpdate(); // Refresh the list
      }
    });
  };

  return (
    <tr className="border-t hover:bg-muted transition-colors duration-200">
      {/* 2. Checkbox cell added */}
      <td className="p-3">
        <input
          type="checkbox"
          className="accent-primary"
          checked={isSelected}
          onChange={(e) => onSelect(e.target.checked)}
        />
      </td>

      <td className="p-3 font-medium">
        {editing ? (
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="h-8"
              autoFocus
            />
            <Button size="sm" onClick={handleRename} disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        ) : (
          <Link
            href={`/Data_source/${folder.name}`} // Use folder.name
            className="flex items-center gap-2 text-gray-900 hover:text-primary hover:underline"
          >
            <IconFolderUp size={18} />
            {folder.name} {/* Use folder.name */}
          </Link>
        )}
      </td>

      <td className="p-3 text-sm">
        {new Date(folder.created_at).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </td>
      <td className="p-3">{folder.total_files}</td>
      <td className="p-3 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <IconDots className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setEditing(true)}>
              <IconPencil className="w-4 h-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleDelete} className="text-red-600 focus:text-red-500">
              <IconTrash className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}