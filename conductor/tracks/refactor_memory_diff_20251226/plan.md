# Plan: Refactor Memory to Code-Style Diffing

This plan outlines the steps to convert the memory system.

## Phase 1: Backend Refactor [checkpoint: 3ef8601]
- [x] Task: Create `src/db/memory.md` with an initial template 3ef8601
- [x] Task: Update `src/prompts/memory.ts` to instruct LLM on editing the Markdown file 3ef8601
- [x] Task: Refactor `src/agents/memory.ts` to read/write Markdown and handle full-text updates 3ef8601
- [x] Task: Update `src/agents/main.ts` to inject the raw Markdown content into the system prompt 3ef8601
- [x] Task: Conductor - User Manual Verification 'Phase 1: Backend Refactor' (Protocol in workflow.md) 3ef8601

## Phase 2: Frontend Update [checkpoint: 7f1e4ce]
- [x] Task: Update `src/actions/memory.ts` to return string content instead of JSON 7f1e4ce
- [x] Task: Update `src/components/MemoryManager.tsx` to display Markdown (text area or preview) 7f1e4ce
- [x] Task: Conductor - User Manual Verification 'Phase 2: Frontend Update' (Protocol in workflow.md) 7f1e4ce
