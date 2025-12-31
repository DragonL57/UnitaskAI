# Specification: Persistent Chat History

## Overview
Currently, the chat refreshes every time the page is reloaded. This track implements a persistence layer for chat messages using a local JSON file (consistent with our current memory architecture).

## User Stories
- **Save History:** As a user, I want my messages and the bot's responses to be automatically saved.
- **Load History:** As a user, I want to see my previous conversation history when I open the application.
- **Clear History:** As a user, I want an option to clear the chat history to start fresh.

## Technical Components

### Backend
- **Storage:** `src/db/chat_history.json`
- **Agent Logic:** `src/agents/history.ts` (New module for Chat History CRUD, separate from Memory Agent).
- **Server Actions:**
    - `getChatHistory()`: Read from file.
    - `saveChatMessage()`: Append new message.
    - `clearChatHistory()`: Wipe file.

### Frontend
- **Chat Component:** Update `src/components/Chat.tsx` to:
    - Fetch history on mount.
    - Optimistically update UI.
    - Add a "Clear History" button.
