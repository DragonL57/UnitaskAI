# Plan: Refactor Memory to Code-Style Diffing

This plan outlines the steps to convert the memory system.

## Phase 1: Backend Refactor
- [ ] Task: Create `src/db/memory.md` with an initial template
- [ ] Task: Update `src/prompts/memory.ts` to instruct LLM on editing the Markdown file
- [ ] Task: Refactor `src/agents/memory.ts` to read/write Markdown and handle full-text updates
- [ ] Task: Update `src/agents/main.ts` to inject the raw Markdown content into the system prompt
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Backend Refactor' (Protocol in workflow.md)

## Phase 2: Frontend Update
- [ ] Task: Update `src/actions/memory.ts` to return string content instead of JSON
- [ ] Task: Update `src/components/MemoryManager.tsx` to display Markdown (text area or preview)
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Frontend Update' (Protocol in workflow.md)
