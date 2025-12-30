# Specification: Project Architecture & Routing Refactor

## Overview
This track focuses on refactoring the application's file structure and routing to improve scalability and maintainability. It introduces a modular, feature-based architecture and a central state management pattern to prevent technical debt during future expansion.

## Functional Requirements
- **Next.js Route Groups:**
    - Organize main app routes into a `(app)` group to separate core product logic from utility routes (e.g., api, landing).
- **Lightweight State Management (Context API):**
    - Implement a `ChatProvider` to manage session state, message history, and loading flags.
    - Objective: Eliminate "prop drilling" where data is passed through multiple layers of UI.
- **Decomposition of Components (Smart vs. Dumb):**
    - **UI Atoms (`src/components/ui`):** Extract stateless, generic elements (e.g., `Button`, `Input`, `IconButton`, `Overlay`).
    - **Sidebar Feature (`src/components/sidebar`):** Break down into `SessionList`, `SessionItem`, `NewChatButton`, and `SearchBox`.
    - **Chat Feature (`src/components/chat`):** Break down into `MessageList`, `MessageItem`, `InputArea`, and `AgentActionLog`.
- **Standardized File Pattern:**
    - Each major component gets its own folder: `src/components/<feature>/<ComponentName>/<ComponentName>.tsx`.
    - Every folder must have an `index.ts` performing a named export.

## Architecture Safety Rules (Critical)
1.  **The Context Rule:** Features that share state (like the sidebar and chat window) MUST use the `ChatProvider` instead of passing props through 3+ levels.
2.  **The UI Atom Rule:** Generic components (Buttons, Cards, Inputs) MUST live in `src/components/ui`. Feature folders may only contain "Smart" components that hold logic or "Molecules" specific to that feature.
3.  **The Named Export Rule:** Use named exports (`export const Component = ...`) exclusively. Default exports are forbidden to ensure consistent naming and reliable IDE refactoring.
4.  **The Extraction Threshold:** Do not extract a sub-component unless it is reused or the parent file exceeds 250 lines.

## Non-Functional Requirements
- **Type Safety:** 100% strict TypeScript typing for all new component interfaces and Context values.
- **Stable Imports:** Use and verify `@/*` aliases to prevent relative path hell.

## Acceptance Criteria
- [ ] Routes are organized using Next.js Route Groups.
- [ ] `ChatProvider` successfully manages state for at least 3 sub-components.
- [ ] Monolithic files (`Chat.tsx`, `Sidebar.tsx`) are reduced in size and complexity.
- [ ] All components follow the new folder and named-export pattern.
- [ ] Build and Lint processes pass with zero errors.

## Out of Scope
- Changing agent logic or prompt architecture.
- Redesigning existing UI/UX (visual style must remain consistent).
