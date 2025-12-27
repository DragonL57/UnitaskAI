# Plan: UI Transparency Log

This plan outlines the steps to visualize agent communication.

## Phase 1: Backend Event Streaming
- [ ] Task: Update `src/agents/main.ts` to yield orchestration events (Thoughts, Actions, Reports)
- [ ] Task: Update `src/app/api/chat/route.ts` to transmit these events through the stream
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Backend Event Streaming' (Protocol in workflow.md)

## Phase 2: UI Integration
- [ ] Task: Update `src/components/Chat.tsx` to parse and store intermediate steps in messages
- [ ] Task: Create a UI component to render the step log within message bubbles
- [ ] Task: Conductor - User Manual Verification 'Phase 2: UI Integration' (Protocol in workflow.md)
