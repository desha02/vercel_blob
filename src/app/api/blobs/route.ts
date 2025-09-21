import { NextResponse } from "next/server";

import { listBlobs } from "@/lib/blobService";

export async function GET() {
  try {
    const blobs = await listBlobs();
    return NextResponse.json({ blobs });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list blobs.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
