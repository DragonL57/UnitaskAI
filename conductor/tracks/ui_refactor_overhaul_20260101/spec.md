# Specification: UI Refactor and Overhaul

## 1. Overview
This track focuses on modernizing the visual aesthetic and improving the overall user experience (UX) of UniTaskAI. The goal is to refine the existing Tailwind/Shadcn UI implementation across the global layout, chat interface, and dashboard to make it cleaner, sharper, and more intuitive.

## 2. Functional Requirements

### 2.1 Visual Modernization
- **Refine Styling:** Update colors, typography, and spacing to create a more modern and cohesive look.
- **Consistency:** Ensure consistent application of styles across all components using existing Tailwind/Shadcn UI patterns.

### 2.2 Layout & Navigation
- **Global Layout Overhaul:** Reorganize and polish the Sidebar, Header, and Dashboard/Home view for better structural clarity.
- **Responsiveness:** Ensure all layout changes are fully responsive and optimized for mobile devices.

### 2.3 Chat Interface Enhancements
- **Markdown & Code Blocks:** Improve the rendering and readability of Markdown content and code snippets within chat bubbles.
- **Consulter Feedback:** Implement distinct visual indicators (icons, colors) to represent "Consulter" critique rounds (e.g., specific styling for approvals vs. critiques).
- **Process Log Optimization:** Make the "Steps Taken" background log more compact and provide a smoother toggle/interaction experience.

## 3. Non-Functional Requirements
- **Performance:** Ensure that UI updates do not negatively impact page load times or interaction latency.
- **Maintainability:** Follow the established modular component architecture (`src/components/ui/` vs feature components).

## 4. Acceptance Criteria
- [ ] Global layout (Sidebar, Header, Dashboard) reflects the modernized design.
- [ ] Chat bubbles render Markdown and Code blocks with high readability.
- [ ] The "Consulter Specialist" actions are visually distinct in the action log.
- [ ] The background process log is compact and functions smoothly.
- [ ] UI is fully responsive across mobile, tablet, and desktop.

## 5. Out of Scope
- Implementation of entirely new agent logic or tools.
- Migration to a different component library (e.g., Material UI).
- Database schema changes.
