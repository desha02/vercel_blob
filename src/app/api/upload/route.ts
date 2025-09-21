import { NextResponse } from "next/server";

import { uploadBlob } from "@/lib/blobService";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const maybeFile = formData.get("file");

    if (!(maybeFile instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const blob = await uploadBlob(maybeFile);

    return NextResponse.json({ blob });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
