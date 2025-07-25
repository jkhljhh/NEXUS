"use client";
import React, { useState, useRef } from 'react';
import { CreateChatForm } from "@/forms/create-chat-form";
// --- Component Imports ---
// Make sure to adjust these paths to match your project structure.
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// --- Icon Imports ---
// Renamed 'File' to 'FileIcon' to avoid conflict with the native File object.
import { Upload, File as FileIcon, Folder, LibraryBig, UploadCloud } from 'lucide-react';

// --- Type Augmentation for React ---
// This declaration adds the non-standard 'webkitdirectory' property to the
// HTML input element's type definition. This is necessary for TypeScript
// to recognize it when used for folder uploads.
declare module 'react' {
  interface InputHTMLAttributes<T> extends React.HTMLAttributes<T> {
    webkitdirectory?: string;
  }
}

type PlatformDoc = {
  name: string;
  type: string;
  size: number;
};

// --- The Main Upload Button Component ---
// This component encapsulates all the upload logic.
const DocumentUploadButton = () => {
    // Explicitly type the state to hold an array of File objects.
    const [files, setFiles] = useState<File[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    // This function is called when files are selected via the input dialog
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = e.target.files ? Array.from(e.target.files) : [];
        if (newFiles.length > 0) {
           setFiles(prev => [...prev, ...newFiles]);
           setIsModalOpen(true); // Open the modal to show selected files
        }
        // Reset the input value to allow selecting the same file again
        if(e.target) e.target.value = "";
    };
    
    // Drag and drop event handlers with explicit types
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); }; // Necessary to allow dropping
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            setFiles(prev => [...prev, ...droppedFiles]);
        }
    };

    // Dummy data for the "Select from Platform" list
    const platformDocs: PlatformDoc[] = [
        { name: "Project_Proposal.pdf", type: "application/pdf", size: 120450 },
        { name: "Q3_Financials.xlsx", type: "application/vnd.ms-excel", size: 850320 },
    ];

    // Handles selecting a file from the platform list with a typed parameter
    const handleSelectFromPlatform = (doc: PlatformDoc) => {
        // Use the native File constructor, which is no longer shadowed
        const mockFile = new File(["mock content"], doc.name, { type: doc.type });
        setFiles(prev => [...prev, mockFile]);
    };

    return (
        <>
            {/* Hidden file inputs for file and folder selection */}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
            <input type="file" ref={folderInputRef} onChange={handleFileChange} className="hidden" webkitdirectory="" />

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon">
                        <Upload className="h-5 w-5" />
                        <span className="sr-only">Upload Documents</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
                        <FileIcon className="w-4 h-4 mr-2" /> Upload File(s)
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => folderInputRef.current?.click()}>
                        <Folder className="w-4 h-4 mr-2" /> Upload Folder
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setIsModalOpen(true)}>
                        <LibraryBig className="w-4 h-4 mr-2" /> Select from Drive
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Upload and Selection Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Upload & Select Documents</DialogTitle>
                        <DialogDescription>
                            Drag and drop files, or select from your existing documents.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Drag and Drop Area */}
                    <div
                        onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
                        className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${isDragging ? 'border-primary bg-primary-foreground' : 'border-border'}`}
                    >
                        <UploadCloud className="w-12 h-12 text-muted-foreground mx-auto" />
                        <p className="mt-2 text-sm text-muted-foreground">Drag & drop files here</p>
                    </div>

                    {/* Combined List of Uploaded and Platform Files */}
                    <div className="mt-6 space-y-4">
                        {files.length > 0 && (
                            <div>
                                <h4 className="font-semibold text-foreground">Ready to Upload</h4>
                                <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto p-1">
                                    {files.map((file, index) => <li key={index} className="text-sm text-muted-foreground truncate">{file.name}</li>)}
                                </ul>
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold text-foreground">Select from Platform</h4>
                            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto p-1">
                                {platformDocs.map((doc, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                        <div className="flex items-center gap-3">
                                            <FileIcon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                                            <p className="font-medium text-sm">{doc.name}</p>
                                        </div>
                                        <Button size="sm" variant="secondary" onClick={() => handleSelectFromPlatform(doc)}>Select</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => { 
                            // Add your actual file processing logic here
                            console.log('Processing files:', files);
                            alert(`${files.length} files ready for processing!`); 
                            setIsModalOpen(false); 
                            setFiles([]); // Clear files after processing
                        }}>
                           Process Files
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
export default DocumentUploadButton;