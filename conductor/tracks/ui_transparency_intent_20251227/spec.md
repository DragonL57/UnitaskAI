# Specification: Transparency Intent Announcement

## Overview
Enhance the "agentic" feel and transparency of the Main Companion Agent by ensuring it announces its plan to the user BEFORE calling a specialist tool. This makes the reasoning process visible and interactive.

## User Stories
- **Visibility of Action:** As a user, I want to know exactly what the bot is about to do (e.g., "I'll check your calendar now") so I'm not just waiting in silence during specialist processing.
- **Improved Trust:** As a user, seeing the agent's intent confirmed before it acts builds trust in its orchestration logic.

## Technical Components

### Backend (`src/agents/main.ts`)
- **Orchestration Loop:** 
    - When `assistantMessage.content` is provided alongside `tool_calls`, yield it as a `chunk` event instead of a `thought` event. This ensures it appears in the main chat bubble.
    - Add a newline suffix to these intent chunks to separate them from future response content.

### Prompts (`src/prompts/main.ts`)
- **Main Prompt Update:** 
    - Explicitly instruct the agent to announce its intent to the user whenever it delegates to a specialist.
    - Example: "I'll ask the researcher to find the latest news for you."
