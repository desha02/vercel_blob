import { del, list, put, type PutBlobResult } from "@vercel/blob";

function assertToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error(
      "Missing BLOB_READ_WRITE_TOKEN. Create a Vercel Blob store and add the Read/Write token to your environment variables."
    );
  }

  return token;
}

export async function listBlobs(prefix = "uploads/") {
  const { blobs } = await list({ token: assertToken(), prefix });
  return blobs;
}

export async function uploadBlob(
  file: File,
  options?: { prefix?: string }
): Promise<PutBlobResult> {
  const prefix = options?.prefix ?? "uploads";
  const safeName = file.name.replace(/\s+/g, "-").toLowerCase();
  const filename = `${prefix}/${Date.now()}-${safeName}`;

  return put(filename, file, {
    access: "public",
    token: assertToken(),
  });
}

export async function deleteBlob(pathname: string) {
  await del(pathname, { token: assertToken() });
}
