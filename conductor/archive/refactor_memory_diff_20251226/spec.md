# Specification: Code-Style Memory with Diffing

## Overview
We are moving away from structured JSON memory (`src/db/memory.json`) to a human-readable Markdown file (`src/db/memory.md`). The Memory Agent will read this file and, when detecting new information, generate a new version of the file (or a specific section) to "patch" the memory.

## User Stories
- **Readable Memory:** As a user, I want to read my memory file like a document or code file.
- **Flexible Context:** As a user, I want the bot to store nuances that don't fit into key-value pairs.

## Technical Components

### Backend
- **Storage:** `src/db/memory.md` (replaces `memory.json`).
- **Memory Agent (`src/agents/memory.ts`):**
    - `readMemory()`: Returns the full string content of `memory.md`.
    - `evaluateAndStore()`:
        1. Read current memory.
        2. Prompt LLM with current memory + user message.
        3. LLM returns the *updated* memory content (or a specific section to append/replace).
        4. Write updates to `memory.md`.
- **Frontend:** Update `MemoryManager` to display the raw Markdown content.
