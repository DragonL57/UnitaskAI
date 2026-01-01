# Plan: UI Refactor and Overhaul

This plan outlines the steps to modernize the UI, improve UX, and refine key components like the Chat Interface and Action Log.

## Phase 1: Global Layout & Visual System [checkpoint: 235302b]
- [x] Task: Audit and update global color palette and typography variables in `globals.css` ab83cce
- [x] Task: Refactor `Sidebar.tsx` for cleaner structure and responsive behavior dc52bac
- [x] Task: Refactor Dashboard/Home page layout for better information density and visual appeal 488afbc
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Global Layout & Visual System' (Protocol in workflow.md)

## Phase 2: Chat Interface Improvements [checkpoint: cb2341d]
- [x] Task: Enhance `MessageItem` component styling for better readability and spacing 0635643
- [x] Task: Update `MarkdownRenderer` (or equivalent) to style code blocks and headers more cleanly b9df0e6
- [x] Task: Refine `InputArea` design for a more modern chat experience 56ef16e
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Chat Interface Improvements' (Protocol in workflow.md)

## Phase 3: Action Log & Consulter Feedback [checkpoint: TBD]
- [ ] Task: Refactor `AgentActionLog` to be more compact by default
- [ ] Task: Implement smoother collapse/expand animations for the action log
- [ ] Task: Add distinct visual states (icons/colors) for "Consulter" actions (Approved vs Critique) in the log
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Action Log & Consulter Feedback' (Protocol in workflow.md)

## Phase 4: Final Polish & Responsiveness [checkpoint: TBD]
- [ ] Task: Conduct a mobile responsiveness audit across all new layouts and fix issues
- [ ] Task: Ensure accessibility (contrast, focus states) across updated components
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Polish & Responsiveness' (Protocol in workflow.md)
