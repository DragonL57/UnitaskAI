# Specification: Core Chatbot Companion

## Overview
This track implements the foundational multi-agent architecture for the AI companion. The system will leverage Next.js for the frontend and backend, Poe API for the language model, and specialized agents for scheduling, research, and memory.

## User Stories
- **Daily Overview:** Users can ask for a summary of their day based on Google Calendar events.
- **Research Assistant:** Users can provide URLs for analysis and perform web searches via Tavily.
- **Persistent Memory:** The chatbot will remember user preferences and past interactions by maintaining a persistent memory file.

## Technical Components

### Frontend (Next.js)
- Responsive chat interface.
- Real-time agent status indicators (transparency).
- Memory management dashboard (view/edit).

### Backend (Next.js Server Actions)
- **Main Companion Agent:** Orchestrates requests and delegates to specialized agents.
- **Scheduler Agent:** Interacts with Google Calendar API.
- **Researcher Agent:** Interacts with Tavily API for search and content extraction.
- **Memory Agent:** Performs CRUD operations on a persistent file to maintain context.

### External APIs
- **Poe API (grok-4.1-fast-non-reasoning):** Core LLM.
- **Google Calendar API:** Schedule management.
- **Tavily API:** Web search and webpage reading.

### Memory Storage
- A persistent file (e.g., `memory.json` or `memory.txt`) managed by the Memory Agent.

## Security & Privacy
- API keys stored in environment variables.
- Server-side execution for all API interactions.
- User-controlled memory (view/edit/delete).
