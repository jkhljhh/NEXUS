"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  IconFolderFilled, 
  IconChevronDown, 
  IconChevronUp,
  IconMessageCircle 
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createClientTwo } from "@/lib/supabase/client";
import { getFolders } from "./create/action";
import { Form } from "./create/form";
import { FolderRow } from ".";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderTitle,
} from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/table-skeleton";

// Type for a single folder object, exported for use in other components
export type Folder = {
  id: number;
  name: string;
  created_at: string;
  total_files: number;
};

type SortKey = "name" | "created_at";
type SortDirection = "asc" | "desc";

export default function Page() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityId, setEntityId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const router = useRouter();
  const [selectedFolderIds, setSelectedFolderIds] = useState<number[]>([]);
  
  const handleSendToChat = () => {
    if (selectedFolderIds.length === 0) {
      toast.error("No folders selected.");
      return;
    }

    const selectedFolderNames = folders
      .filter((folder) => selectedFolderIds.includes(folder.id))
      .map((folder) => folder.name);

    localStorage.setItem(
      'chat-selected-files', 
      JSON.stringify(selectedFolderNames)
    );
    
    toast.success(`${selectedFolderNames.length} folder(s) sent to chat!`);
    router.push("/");
  };

  const refreshFolders = async () => {
    setLoading(true);
    const result = await getFolders();
    setFolders(result || []);
    setLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClientTwo();
      const { data: entityData } = await supabase
        .from("entity")
        .select("id")
        .limit(1)
        .single();

      if (entityData) setEntityId(entityData.id);
      
      await refreshFolders();
    };

    fetchData();
  }, []);

  const filteredFolders = useMemo(() => {
    let filtered = folders.filter((folder) =>
      folder.name.toLowerCase().includes(search.toLowerCase())
    );

    filtered.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [folders, search, sortKey, sortDirection]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  return (
    <>
      <PageHeader>
        <div className="gap-1 flex flex-col sm:flex-row sm:items-center sm:justify-between w-full mt-16">
          <div className="flex items-center gap-3">
            <IconFolderFilled />
            <div className="flex flex-col">
              <PageHeaderTitle>Folder</PageHeaderTitle>
              <PageHeaderDescription>
                Create and upload folders and files
              </PageHeaderDescription>
            </div>
          </div>
          {entityId && <Form id={entityId} onUpdate={refreshFolders} />}
        </div>
      </PageHeader>
      
      <div className="mt-4 flex justify-between items-center gap-4">
        <Input
          placeholder="Search folders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        
        {selectedFolderIds.length > 0 && (
          <Button onClick={handleSendToChat}>
            <IconMessageCircle className="mr-2 h-4 w-4" />
            Send to Chat
          </Button>
        )}
      </div>

      <div className="mt-6 overflow-x-auto rounded-md border bg-white">
        {loading ? (
          <TableSkeleton />
        ) : (
          <table className="w-full table-auto text-left text-sm text-gray-900">
            <thead className="bg-muted">
              <tr>
                <th className="p-3 w-12">
                  <input type="checkbox" className="accent-primary" />
                </th>
                <th
                  className="p-3 font-semibold text-gray-900 cursor-pointer select-none"
                  onClick={() => toggleSort("name")}
                >
                  Folder Name{" "}
                  {sortKey === "name" &&
                    (sortDirection === "asc" ? <IconChevronUp className="inline w-4 h-4" /> : <IconChevronDown className="inline w-4 h-4" />)}
                </th>
                <th
                  className="p-3 font-semibold text-gray-900 cursor-pointer select-none"
                  onClick={() => toggleSort("created_at")}
                >
                  Created At{" "}
                  {sortKey === "created_at" &&
                    (sortDirection === "asc" ? <IconChevronUp className="inline w-4 h-4" /> : <IconChevronDown className="inline w-4 h-4" />)}
                </th>
                <th className="p-3 font-semibold text-gray-900">Total Files</th>
                <th className="p-3 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFolders.map((folder) => (
                <FolderRow
                  key={folder.id}
                  folder={folder}
                  isSelected={selectedFolderIds.includes(folder.id)}
                  onSelect={(isChecked: boolean) => {
                    if (isChecked) {
                      setSelectedFolderIds((prev) => [...prev, folder.id]);
                    } else {
                      setSelectedFolderIds((prev) =>
                        prev.filter((id) => id !== folder.id)
                      );
                    }
                  }}
                  onUpdate={refreshFolders}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}