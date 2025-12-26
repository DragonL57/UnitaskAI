# Technology Stack

This document outlines the core technologies and architectural choices for the multi-agent chatbot companion.

## Frontend & Framework
- **Next.js:** A React-based framework for building a fast, modern web application.
- **Vercel:** The primary deployment and hosting platform, optimized for Next.js.
- **TypeScript:** Ensuring type safety across the entire codebase.

## Backend & Logic
- **Modular Architecture:** A clean separation of concerns:
    - `agents/`: Dedicated logic for the Main Companion, Scheduler, Researcher, and Memory agents.
    - `prompts/`: Managed prompt templates for each agent to ensure consistent behavior.
    - `tools/`: Independent modules for external API interactions.
- **Next.js Server Actions:** Used for secure, server-side execution of agent logic and API calls.

## Language Model & API
- **Poe API:** Utilizing the Poe API with the `grok-4.1-fast-non-reasoning` model for all natural language processing tasks.
- **OpenAI Client Library:** Leveraging the `openai` SDK configured with the Poe `baseURL` and `apiKey`.

## External Integrations
- **Google Calendar API:** Integrated via server-side modules for managing schedules.
- **Tavily Search API:** Used for high-performance web searching and webpage content extraction.

## Memory System
- **Agent-Managed File Storage:** A unique approach where a dedicated, silent "Memory Agent" maintains a persistent text-based or structured file.
- **CRUD Memory Management:** The Memory Agent is responsible for reading, writing, updating, and deleting information from this central file based on conversation context.

## Deployment
- **Vercel:** Automated deployments, environment variable management, and serverless function execution.

## Implementation Details
- **Authentication:** Uses `google.auth.GoogleAuth` with Service Account credentials for secure, server-side Google Calendar access.
- **Orchestration:** Leverages native LLM function calling (tools) for robust and reliable delegation between the Main, Scheduler, and Researcher agents.
- **Memory:** Implements a "Silent Observer" pattern where a secondary LLM call evaluates user messages in the background to update persistent storage. Moved from JSON to Markdown storage to support "code style" full-text updates and cleaner human readability.
