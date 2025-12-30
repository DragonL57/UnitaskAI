# Plan: Sidebar Session History with Neon DB

This plan outlines the steps to implement persistent chat session history using Neon DB and a collapsible sidebar UI.

## Phase 1: Database & Backend Setup
- [x] Task: Initialize Neon DB and install dependencies (drizzle-orm, pg, @neondatabase/serverless) 8e9a2d8
- [x] Task: Define Drizzle schema for `sessions` and `messages` 410a9e3
- [ ] Task: Create database migration and push to Neon
- [ ] Task: Implement server actions for CRUD operations on sessions and messages
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Database & Backend Setup' (Protocol in workflow.md)

## Phase 2: UI Foundation & Routing
- [ ] Task: Set up Next.js dynamic routing for `/sessions/[id]`
- [ ] Task: Refactor `src/app/page.tsx` and `src/components/Chat.tsx` to support session-based loading
- [ ] Task: Implement the Sidebar component structure (collapsible, mobile-first overlay)
- [ ] Task: Integrate Sidebar into the main layout
- [ ] Task: Conductor - User Manual Verification 'Phase 2: UI Foundation & Routing' (Protocol in workflow.md)

## Phase 3: Session Management Features
- [ ] Task: Implement the Session History List with chronological grouping
- [ ] Task: Add Auto-Titling logic using LLM after the first exchange
- [ ] Task: Implement Search, Rename, and Delete functionality in the Sidebar
- [ ] Task: Ensure session sorting (active session moves to top)
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Session Management Features' (Protocol in workflow.md)

## Phase 4: Refinement & Mobile Optimization
- [ ] Task: Fine-tune Sidebar animations and mobile responsiveness
- [ ] Task: Final linting and type checking across the new modules
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Refinement & Mobile Optimization' (Protocol in workflow.md)
