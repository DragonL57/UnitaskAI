# Specification: Vercel Blob Memory Storage

## Overview
To support deployment on Vercel's serverless environment, we must replace the local filesystem storage (`src/db/memory.md`) with a persistent cloud solution. We will use Vercel Blob Storage to host the `memory.md` file, treating it as a single object that we read and overwrite.

## User Stories
- **Persistent Memory on Web:** As a user, I want my memory to persist even when the server restarts or I access the app from a different device.

## Technical Components

### Backend
- **Dependency:** `@vercel/blob`
- **Memory Agent (`src/agents/memory.ts`):**
    - Replace `fs.readFile` with `fetch(url)` (after getting the URL from Vercel Blob `list` or environment variable).
    - Replace `fs.writeFile` with `put('memory.md', content, { access: 'public' })`.
- **Environment:** Requires `BLOB_READ_WRITE_TOKEN`.

### Migration Strategy
- The app will attempt to find a blob named `memory.md`.
- If not found, it will create one with the initial template.
