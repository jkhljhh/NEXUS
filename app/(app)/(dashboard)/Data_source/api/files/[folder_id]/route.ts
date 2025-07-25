// File: app/Data_source/api/files/[folder_id]/route.ts

import { NextResponse } from "next/server";
// Adjust this import path to where your action.ts file is located
import { getFilesByFolder } from "../../../create/action";

// Updated interface to match the actual parameter name
interface Params {
  params: {
    folder_id: string;
  };
}

// This function handles GET requests to /api/files/[some_id]
export async function GET(request: Request, { params }: Params) {
  console.log("API ROUTE HIT: /api/files/[folder_id]");
  console.log("Received params:", params);

  try {
    // --- CORRECTED PARAMETER NAME ---
    // We are now using params.folder_id to match what Next.js provides
    const folderId = parseInt(params.folder_id, 10);
    console.log("Parsed folderId as integer:", folderId);

    // Check if the folderId is a valid number
    if (isNaN(folderId)) {
      console.error("Validation failed: folderId is NaN");
      return NextResponse.json(
        { error: "Invalid folder ID" },
        { status: 400 }
      );
    }

    // 1. Reuse your new function to get data from Supabase
    const files = await getFilesByFolder(folderId);

    // 2. Return the data as a JSON response
    console.log(`Successfully fetched ${files.length} files for folder ${folderId}.`);
    return NextResponse.json(files, { status: 200 });
  } catch (error) {
    // If something goes wrong, return an error response
    console.error(`API Error fetching files for folder ${params.folder_id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
