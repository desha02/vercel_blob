"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";

type BlobItem = {
  pathname: string;
  uploadedAt: string;
  size: number;
  url: string;
};

type ApiResponse<T> = { error?: string } & T;

const formatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value > 100 ? 0 : 1)} ${sizes[i]}`;
}

export function BlobDemo() {
  const [blobs, setBlobs] = useState<BlobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBlobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/blobs");
      const body = (await response.json()) as ApiResponse<{ blobs: BlobItem[] }>;

      if (!response.ok) {
        throw new Error(body.error ?? "Unable to list blobs.");
      }

      setBlobs(body.blobs ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlobs();
  }, [fetchBlobs]);

  const handleUpload = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setMessage(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const body = (await response.json()) as ApiResponse<Record<string, unknown>>;

      if (!response.ok) {
        throw new Error(body.error ?? "Upload failed");
      }

      setMessage(`Uploaded ${file.name}`);
      await fetchBlobs();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
    } finally {
      event.target.value = "";
    }
  }, [fetchBlobs]);

  const handleDelete = useCallback(
    async (pathname: string) => {
      try {
        const response = await fetch("/api/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pathname }),
        });
        const body = (await response.json()) as ApiResponse<Record<string, unknown>>;

        if (!response.ok) {
          throw new Error(body.error ?? "Unable to delete blob");
        }

        setMessage(`Deleted ${pathname}`);
        await fetchBlobs();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      }
    },
    [fetchBlobs]
  );

  const hasBlobs = blobs.length > 0;

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-neutral-900">Vercel Blob demo</h1>
          <p className="text-sm text-neutral-600">
            Upload a file to your Blob store, then view or delete it using the API routes.
          </p>
        </header>
        <label className="mt-4 inline-flex w-fit cursor-pointer items-center gap-3 rounded-lg border border-dashed border-neutral-300 px-4 py-3 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50">
          <input
            type="file"
            onChange={handleUpload}
            className="hidden"
          />
          <span className="text-sm font-medium">Choose file…</span>
        </label>
        {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Stored blobs</h2>
          <button
            type="button"
            onClick={fetchBlobs}
            className="text-sm text-blue-600 hover:underline"
          >
            Refresh
          </button>
        </header>
        {isLoading ? (
          <p className="mt-4 text-sm text-neutral-600">Loading…</p>
        ) : hasBlobs ? (
          <table className="mt-4 w-full table-fixed border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="w-1/2">Path</th>
                <th className="w-24">Size</th>
                <th className="w-24">Uploaded</th>
                <th className="w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blobs.map((blob) => (
                <tr key={blob.pathname} className="rounded bg-neutral-50 text-sm text-neutral-700">
                  <td className="truncate px-3 py-2">
                    <a
                      href={blob.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {blob.pathname}
                    </a>
                  </td>
                  <td className="px-3 py-2">{formatBytes(blob.size)}</td>
                  <td className="px-3 py-2">
                    {formatter.format(new Date(blob.uploadedAt))}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(blob.pathname)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="mt-4 text-sm text-neutral-600">No blobs uploaded yet.</p>
        )}
      </section>
    </div>
  );
}
