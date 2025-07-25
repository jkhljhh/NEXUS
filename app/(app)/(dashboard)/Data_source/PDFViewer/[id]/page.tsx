"use client";

import { useSearchParams } from "next/navigation";
//import PdfViewer from "@/components/pdf"; // Update path as needed
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";


export default function PDFViewerPage({ params }: { params: Promise<{ id: any,url:any }> }) {
  
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
 // console.log("URL received:", params.url);
  const router = useRouter();

  if (!url) return <div className="p-6 text-red-500">Missing PDF URL</div>;

  return (
    <div className="p-6 space-y-6">
      <Button onClick={() => router.back()} className="mb-4">
        ← Back
      </Button>
      <h1 className="text-xl font-semibold">Viewing document</h1>
      <div className="w-full h-full overflow-hidden">
        {/* <PdfViewer url={url} /> */}
      </div>
    </div>
  );
}
