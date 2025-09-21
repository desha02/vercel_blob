import { NextResponse } from "next/server";

import { deleteBlob } from "@/lib/blobService";

export async function POST(req: Request) {
  try {
    const { pathname } = await req.json();

    if (!pathname || typeof pathname !== "string") {
      return NextResponse.json(
        { error: "Missing blob pathname." },
        { status: 400 }
      );
    }

    await deleteBlob(pathname);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete blob.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
