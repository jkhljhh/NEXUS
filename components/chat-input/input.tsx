"use client";
import { useState, useRef, useLayoutEffect,useEffect} from "react";
import Link from "next/link";
import {
  IconPaperclip,
  IconUpload,
  IconFolder,
  IconArrowUp,
  IconClearFormatting,
  IconLoader2,
  IconTextSize,
  IconFile,
  IconX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQueryState } from "nuqs";
import { MicInput } from "./mic-input";
import { AutoComplete } from "./auto-complete";

const tabPlaceholders: Record<string, string> = {
  summary: "Ask anything about the summary...",
  insights: "Ask for insights or trends...",
  rca: "Ask about root cause analysis...",
  forecast: "Ask for future projections...",
  actions: "Suggest or ask about possible actions...",
  analyst: "Ask an analyst-style question...",
};

export function ChatInput({
  onSubmit,
  value,
  setValue,
  loading,
  className,
}: {
  // 1. onSubmit now accepts an array of files
  onSubmit: (e: React.FormEvent, context?: { files?: string[] }) => void;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  loading?: boolean;
  className?: string;
}) {
  const [tab] = useQueryState("tab");
  const [focused, setFocused] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    // Check for files passed from the other page when the component loads
    const filesToLoad = localStorage.getItem('chat-selected-files');

    if (filesToLoad) {
      try {
        const fileNames = JSON.parse(filesToLoad);
        // Make sure it's an array before adding
        if (Array.isArray(fileNames) && fileNames.length > 0) {
          addFiles(fileNames); // Use your existing addFiles function
        }
      } catch (e) {
        console.error("Failed to parse files from localStorage", e);
      } finally {
        // IMPORTANT: Clear the item so files are not re-added on page refresh
        localStorage.removeItem('chat-selected-files');
      }
    }
  }, []);

  // 2. State is now an array to hold multiple file names
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3. Logic to add new files to the state, preventing duplicates
  const addFiles = (filesToAdd: string[]) => {
    setSelectedFiles((prevFiles) => {
      const newFiles = filesToAdd.filter((name) => !prevFiles.includes(name));
      return [...prevFiles, ...newFiles];
    });
  };
  
  // 4. Logic to remove a single file from the selection
  const removeFile = (fileNameToRemove: string) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((fileName) => fileName !== fileNameToRemove)
    );
  };

  // 5. Logic to clear all selected files
  const clearAllFiles = () => {
    setSelectedFiles([]);
  };
  
  // 6. Form submission now handles the array of files
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() && selectedFiles.length === 0) return;

    const submissionContext =
      selectedFiles.length > 0 ? { files: selectedFiles } : undefined;

    onSubmit(e, submissionContext);

    clearAllFiles();
  };
  
  // 7. Textarea resizes based on value or selected files
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 192)}px`;
    }
  }, [value, selectedFiles]);

  // 8. Placeholder updates based on whether files are selected
  const placeholder =
    selectedFiles.length > 0
      ? `Ask a question about ${selectedFiles.length} selected file(s)...`
      : tab
      ? tabPlaceholders[tab]
      : "Set the context first...";

  // 9. Handle multiple files from the input element
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map((file) => file.name);
      addFiles(fileNames);
      setMenuOpen(false);
    }
    // Reset the input so the same file can be selected again if removed
    e.target.value = "";
  };

  // Logic for closing menu remains the same
  const menuRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          "relative flex flex-col w-full bg-secondary rounded-xl py-2.5 gap-2 border",
          className
        )}
      >
        {/* 10. UI to display multiple selected files */}
        {selectedFiles.length > 0 && (
          <div className="mx-2.5 mb-2 flex flex-col gap-2 rounded-lg border bg-background px-3 py-2">
            <div className="flex items-center justify-between">
               <span className="text-xs font-semibold text-gray-500 uppercase">Context Files</span>
               <button
                  type="button"
                  onClick={clearAllFiles}
                  className="text-xs font-medium text-blue-600 hover:underline"
               >
                  Clear all
               </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {selectedFiles.map((fileName) => (
                <div
                  key={fileName}
                  className="flex items-center gap-2 truncate rounded-md bg-gray-100 px-2 py-1"
                >
                  <IconFile className="size-4 flex-shrink-0 text-gray-600" />
                  <span className="truncate text-sm font-medium">{fileName}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(fileName)}
                    className="rounded-full p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                  >
                    <IconX className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {menuOpen && (
          <div ref={menuRef} className={cn("absolute right-3 -top-13 z-20 flex flex-row gap-3")}>
            <div className={cn("bg-white border rounded-lg shadow-lg px-2 py-1.5 w-28 text-xs flex items-center gap-2 hover:bg-gray-50 cursor-pointer")} onClick={() => { fileInputRef.current?.click(); }}>
              <IconUpload className="size-4" /> <span>File</span>
              {/* 11. Added 'multiple' attribute to file input */}
              <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileChange} tabIndex={-1} multiple />
            </div>
            <Link 
              href="/Data_source" 
              onClick={() => setMenuOpen(false)} 
              className={cn("bg-white border rounded-lg shadow-lg px-2 py-1.5 w-28 text-xs flex items-center gap-2 hover:bg-gray-50 cursor-pointer")}
            >
              <IconFolder className="size-4" /> <span>Folder</span>
            </Link>
          </div>
        )}

        <form onSubmit={handleFormSubmit}>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className={cn("w-full resize-none px-2.5 outline-none bg-transparent text-sm max-h-48 overflow-y-auto", "transition-all duration-300", focused ? "min-h-[128px] max-h-60" : "min-h-[48px] max-h-20")}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleFormSubmit(e as any); } }}
            />
            {showAutocomplete && <AutoComplete value={value} onSelect={(val) => setValue(val)} />}
          </div>
          <div className={cn("flex gap-2 mt-2 px-2.5 items-center")}>
            <Button type="button" size="icon" variant="ghost" aria-label="Attach" className={cn("rounded-full")} onClick={() => setMenuOpen((open) => !open)}>
              <IconPaperclip className="size-5" />
            </Button>
            <Button type="button" size="icon" variant="ghost" onClick={() => setShowAutocomplete((prev) => !prev)} className={cn(showAutocomplete && "bg-black/5 hover:bg-black/5", "hover:cursor-pointer rounded-full")}>
              {showAutocomplete ? <IconTextSize className="size-5" /> : <IconClearFormatting className="size-5" />}
            </Button>
            <MicInput onResult={(text) => setValue((v) => v + text)} disabled={loading} />
            <Button type="submit" size="icon" variant="outline" className={cn("rounded-full hover:cursor-pointer bg-primary text-primary-foreground")} disabled={loading || (!value.trim() && selectedFiles.length === 0)}>
              {loading ? <IconLoader2 className="size-5 animate-spin" /> : <IconArrowUp className="size-5" />}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}