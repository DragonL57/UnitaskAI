# Specification: Memory Agent as Silent Observer

## Overview
Instead of relying on the Main Agent to call a memory tool, the Memory Agent will act as a silent observer. It will analyze every user message (and potentially the conversation context) to autonomously detect and store relevant facts, preferences, and user details.

## User Stories
- **Passive Memory:** As a user, I want the bot to remember details I mention naturally (e.g., "My name is Long") without me having to command it.
- **Background Processing:** As a developer, I want this to happen automatically for every message.

## Technical Components

### Backend
- **Memory Agent (`src/agents/memory.ts`):**
    - Implement a new function `evaluateAndStore(userQuery: string, history: MessageContext[])`.
    - This function will use the LLM to analyze the text and decide if a memory update is needed.
    - If yes, it calls `addOrUpdateMemory`.
- **Chat Action (`src/actions/chat.ts`):**
    - Call `evaluateAndStore` in the background (fire-and-forget or await) when processing a message.
