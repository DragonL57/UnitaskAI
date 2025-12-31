# Specification: Streaming & Markdown Rendering

## Overview
This track focuses on making the chat experience more interactive and readable. 
1.  **Streaming:** Users will see the AI response as it's being generated, reducing perceived latency.
2.  **Markdown:** Chat bubbles will render formatted text, links, and lists.

## Technical Components

### Backend
- **New Route Handler:** `src/app/api/chat/route.ts` will replace the `sendChatMessage` server action for the main chat flow. It will return a `ReadableStream`.
- **Agent Refactor:** Update `src/agents/main.ts` to support streaming mode (returning an iterable or stream).

### Frontend
- **Dependency:** `react-markdown`, `remark-gfm`.
- **Chat Component:** Update `src/components/Chat.tsx` to:
    - Use `fetch()` to call the `/api/chat` endpoint.
    - Read the response stream chunk-by-chunk.
    - Render message content using `ReactMarkdown`.
