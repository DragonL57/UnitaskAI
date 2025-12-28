# Specification: Sidebar Session History with Neon DB

## Overview
This track introduces persistent chat session history to the application. It includes a new collapsible sidebar for navigating past conversations, a database migration to Neon DB for session storage, and an updated UI to support multiple chat threads.

## Functional Requirements
- **Neon DB Integration:**
    - Set up a Neon PostgreSQL database.
    - Implement Drizzle ORM for data access.
    - Store session metadata (ID, title, created_at, updated_at) and message history (role, content, timestamp).
- **Collapsible Sidebar (Mobile-First):**
    - **Desktop:** A left-aligned sidebar that can be toggled open/closed. When open, it pushes main content.
    - **Mobile:** A slide-out overlay drawer.
- **Session History List:**
    - **Grouping:** Chronological grouping (Today, Yesterday, Previous 7 Days, etc.).
    - **Management:** Users can search sessions, rename them, and delete them.
    - **Dynamic Sorting:** Selecting an old session and sending a new message pushes that session to the top of the list (Last-In-First-Out).
    - **Auto-Titling:** Use the LLM to generate a concise title based on the first few messages of a new session.
- **Routing:** Use Next.js dynamic routes (e.g., `/sessions/[id]`) to switch between different chat sessions.

## Non-Functional Requirements
- **Hybrid Storage:** Long-term "facts" remain in the Vercel Blob / `memory.md` file, while ephemeral chat logs move to Neon DB.
- **Responsiveness:** The sidebar must adapt seamlessly between desktop and mobile views.

## Acceptance Criteria
- [ ] Users can start a new chat, and it appears in the sidebar history.
- [ ] Users can navigate back to a previous session and see the full message history.
- [ ] Sending a message in an old session updates its "updated_at" timestamp and moves it to the top of the sidebar.
- [ ] The sidebar is collapsible on desktop and behaves as an overlay on mobile.
- [ ] Session titles are automatically generated or can be manually renamed/deleted.

## Out of Scope
- Migrating the `memory.md` logic to Neon DB (remaining as-is).
- User authentication/accounts (sessions will be local/public for now unless specified).
