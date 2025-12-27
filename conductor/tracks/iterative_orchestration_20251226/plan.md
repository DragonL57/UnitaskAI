# Plan: Iterative Multi-Agent Orchestration

This plan outlines the steps to enable multi-round agent communication.

## Phase 1: Core Loop Implementation [checkpoint: 4c336e8]
- [x] Task: Refactor `src/agents/main.ts` to implement the iterative orchestration loop 4c336e8
- [x] Task: Update `src/prompts/main.ts` to support multi-step reasoning and dialogue 4c336e8
- [x] Task: Update sub-agent prompts to encourage requesting follow-ups from the Main Agent 4c336e8
- [x] Task: Conductor - User Manual Verification 'Phase 1: Core Loop Implementation' (Protocol in workflow.md) 4c336e8

## Phase 2: Refinement & Testing
- [ ] Task: Test a complex multi-agent scenario (e.g., Search then Schedule)
- [ ] Task: Ensure streaming correctly handles the final loop output
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Refinement & Testing' (Protocol in workflow.md)
