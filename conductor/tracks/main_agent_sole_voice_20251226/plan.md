# Plan: Main Agent as Sole Voice

This plan outlines the steps to centralize communication in the Main Agent.

## Phase 1: Sub-Agent Refactor
- [x] Task: Refactor `src/agents/scheduler.ts` to return raw data only
- [x] Task: Refactor `src/agents/researcher.ts` to return raw data only
- [x] Task: Simplify sub-agent prompts in `src/prompts/`
- [x] Task: Conductor - User Manual Verification 'Phase 1: Sub-Agent Refactor' (Protocol in workflow.md)

## Phase 2: Main Agent Refinement
- [x] Task: Update `src/agents/main.ts` to handle and synthesize raw worker data
- [x] Task: Update `src/prompts/main.ts` to emphasize the sole-voice responsibility
- [x] Task: Conductor - User Manual Verification 'Phase 2: Main Agent Refinement' (Protocol in workflow.md)
