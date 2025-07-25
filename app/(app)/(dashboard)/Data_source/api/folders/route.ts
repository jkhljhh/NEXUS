// File: app/api/folders/route.ts

import { NextResponse } from "next/server";
import { getFolders } from "../../create/action"; // Adjust this import path to where your action.ts file is located

// This function handles GET requests to /api/folders
export async function GET() {
  try {
    // 1. Reuse your existing function to get data from Supabase
    const folders = await getFolders();

    // 2. Return the data as a JSON response
    // We include CORS headers to allow your other application (e.g., on localhost:3000) to access this API
    return NextResponse.json(folders, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "'http://localhost:3000", // Or specify your chat app's domain e.g., 'http://localhost:3000'
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    // If something goes wrong, return an error response
    console.error("API Error fetching folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

// This function is necessary to handle preflight requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*", // Or specify your chat app's domain
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
