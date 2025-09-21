# Vercel Blob Sample

This project shows how to connect a Next.js application to the [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) storage service so you can upload, list, and delete files.

The UI is intentionally minimal: choose a file to upload, then see it appear in the table with direct download links. All storage operations happen through Next.js App Router API routes that call the official `@vercel/blob` SDK.

## Prerequisites

1. Install the project dependencies:

   ```bash
   npm install
   ```

2. Create a Blob store in your Vercel project. From the Blob dashboard copy a **Read/Write token**.

3. Add the token to a `.env.local` file in the project root:

   ```bash
   cp .env.example .env.local
   # edit the file and paste your token
   ```

   The app reads the token from `BLOB_READ_WRITE_TOKEN` both locally and when deployed to Vercel.

## Running locally

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the demo. Uploading, listing, and deleting files will all hit the Blob API using your Read/Write token.

## Deploying to Vercel

1. Push this repository to Git.
2. Create a new Vercel project from the repo.
3. In **Project Settings → Environment Variables** add `BLOB_READ_WRITE_TOKEN` with the value from your Blob store (scope it to the environments you need).
4. Trigger a deployment. Once live, the `/api/upload`, `/api/blobs`, and `/api/delete` routes will use the token that Vercel injects at runtime.

## How it works

- `src/app/api/upload/route.ts` receives multipart form uploads, sends the file to Vercel Blob with `put`, and returns the resulting public URL.
- `src/app/api/blobs/route.ts` lists every blob stored under the `uploads/` prefix so the UI can show the table of files.
- `src/app/api/delete/route.ts` accepts a blob pathname and removes it via the Blob API.
- `src/app/components/blob-demo.tsx` is a client component that talks to those API routes and renders the interface.
- `src/lib/blobService.ts` centralises the Blob SDK calls and ensures the Read/Write token is present before any request.

Feel free to expand on this base: add auth, restrict file types, connect Blob metadata to a database, or trigger background jobs once uploads complete.
