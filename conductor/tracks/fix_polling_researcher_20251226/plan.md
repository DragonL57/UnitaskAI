# Plan: Fix Polling & Researcher Response

This plan outlines the steps to improve UI performance and fix agent logic.

## Phase 1: Frontend Fixes [checkpoint: 49d6ee0]
- [x] Task: Remove polling from `src/components/MemoryManager.tsx` and restore manual refresh button 49d6ee0
- [x] Task: Conductor - User Manual Verification 'Phase 1: Frontend Fixes' (Protocol in workflow.md) 49d6ee0

## Phase 2: Backend Debugging
- [ ] Task: Update `src/agents/researcher.ts` to debug LLM summarization response
- [ ] Task: Truncate search results in `src/tools/tavily.ts` or `src/agents/researcher.ts` to avoid context limit issues
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Backend Debugging' (Protocol in workflow.md)
