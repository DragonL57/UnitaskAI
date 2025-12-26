# Plan: Streaming & Markdown Rendering

This plan outlines the steps to implement streaming and markdown.

## Phase 1: Markdown Rendering [checkpoint: 6e2afc9]
- [x] Task: Install `react-markdown` and `remark-gfm` 6e2afc9
- [x] Task: Update `Chat.tsx` to render Markdown in message bubbles 6e2afc9
- [x] Task: Conductor - User Manual Verification 'Phase 1: Markdown Rendering' (Protocol in workflow.md) 6e2afc9

## Phase 2: Streaming Implementation
- [ ] Task: Update `src/agents/main.ts` to support streaming (OpenAI streaming API)
- [ ] Task: Create `src/app/api/chat/route.ts` for native streaming response
- [ ] Task: Refactor `Chat.tsx` to use the streaming API via `fetch`
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Streaming Implementation' (Protocol in workflow.md)
