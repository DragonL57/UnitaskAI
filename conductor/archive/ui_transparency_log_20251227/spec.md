# Specification: UI Transparency Log

## Overview
We want to make the "invisible" work of the agents visible to the user. This involves streaming intermediate states (thoughts, actions, reports) from the backend and rendering them as a sequential log in the chat UI.

## User Stories
- **Reasoning Transparency:** As a user, I want to see *how* the bot is arriving at its answer.
- **Action Verification:** As a user, I want to know exactly which tools (e.g., "delete calendar event") are being triggered in real-time.

## Technical Components

### Backend
- **Event Protocol:** Define a set of string prefixes for the stream:
    - `__AGENT__:<name>`: Current worker.
    - `__THOUGHT__:<text>`: The Main Agent's reasoning.
    - `__ACTION__:<text>`: Description of a tool being called.
    - `__REPORT__:<text>`: Summary of a specialist's finding.
- **Agent Logic (`src/agents/main.ts`):** Modify the `while` loop to return an `AsyncGenerator` or similar structure that yields these events.
- **Route Handler (`src/app/api/chat/route.ts`):** Transmit these events as they occur.

### Frontend
- **State Management (`src/components/Chat.tsx`):**
    - Add a `steps` array to each `Message` object.
    - Update the stream reader to parse prefixed chunks and populate the `steps` array.
- **UI Rendering:**
    - Create an `ActionLog` component to display the steps in a clean, vertical list (similar to a "Thought process" dropdown).
