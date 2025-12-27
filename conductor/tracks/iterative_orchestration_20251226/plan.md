# Plan: Iterative Multi-Agent Orchestration

This plan outlines the steps to enable multi-round agent communication.

## Phase 1: Core Loop Implementation
- [ ] Task: Refactor `src/agents/main.ts` to implement the iterative orchestration loop
- [ ] Task: Update `src/prompts/main.ts` to support multi-step reasoning and dialogue
- [ ] Task: Update sub-agent prompts to encourage requesting follow-ups from the Main Agent
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Core Loop Implementation' (Protocol in workflow.md)

## Phase 2: Refinement & Testing
- [ ] Task: Test a complex multi-agent scenario (e.g., Search then Schedule)
- [ ] Task: Ensure streaming correctly handles the final loop output
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Refinement & Testing' (Protocol in workflow.md)
