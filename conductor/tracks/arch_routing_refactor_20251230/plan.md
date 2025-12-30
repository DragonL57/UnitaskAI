# Plan: Project Architecture & Routing Refactor

This plan outlines the steps to refactor the application into a modular, feature-based architecture using Next.js Route Groups and the React Context API.

## Phase 1: Infrastructure & Route Groups [checkpoint: a024fd4]
- [x] Task: Create Next.js Route Group `(app)` and move existing routes into it b64711c
- [x] Task: Update `tsconfig.json` paths to ensure `@/components/*` and other aliases are correctly set up d71b1fc
- [x] Task: Verify that all existing routes (`/`, `/sessions/[id]`) still function correctly after the move d71b1fc
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure & Route Groups' (Protocol in workflow.md)

## Phase 2: State Management (Context API) [checkpoint: 80bbc79]
- [x] Task: Implement `ChatProvider` in `src/context/ChatContext.tsx` to handle shared session and message state e6718d2
- [x] Task: Wrap the application (within the route group) with `ChatProvider` d7bc4fd
- [x] Task: Refactor `src/components/Chat.tsx` and `src/components/Sidebar.tsx` to consume state from `ChatContext` instead of local state/server actions directly f651e24
- [ ] Task: Conductor - User Manual Verification 'Phase 2: State Management (Context API)' (Protocol in workflow.md)

## Phase 3: Component Decomposition - UI Atoms
- [ ] Task: Create `src/components/ui` directory and extract basic atoms (e.g., `Button`, `Input`, `IconButton`)
- [ ] Task: Standardize atoms to use named exports and consistent prop patterns
- [ ] Task: Replace direct Tailwind styling in feature components with these new atoms where applicable
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Component Decomposition - UI Atoms' (Protocol in workflow.md)

## Phase 4: Component Decomposition - Sidebar & Chat Features
- [ ] Task: Refactor Sidebar into `src/components/sidebar/` sub-components (`SessionList`, `SessionItem`, `NewChatButton`, `SearchBox`)
- [ ] Task: Refactor Chat into `src/components/chat/` sub-components (`MessageList`, `MessageItem`, `InputArea`, `AgentActionLog`)
- [ ] Task: Implement the "Standardized File Pattern" (Folder > Component file + index.ts) for all refactored components
- [ ] Task: Final cleanup: Remove old monolithic `Sidebar.tsx` and `Chat.tsx` (or repurpose them as feature containers)
- [ ] Task: Run project-wide linting and type checking to ensure zero regressions
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Component Decomposition - Sidebar & Chat Features' (Protocol in workflow.md)
