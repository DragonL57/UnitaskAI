# Specification: Main Agent as Sole Voice

## Overview
Currently, the Scheduler and Researcher agents perform their own summarization and speak directly to the Main Agent's tool-response loop. We want to strip the sub-agents of their "voice". They should become strictly "Worker Agents" that return structured data or raw information. The Main Agent will then take that data and generate the final conversational response for the user.

## User Stories
- **Consistent Voice:** As a user, I want the bot's tone to be consistent throughout the conversation, regardless of which tool is being used.
- **Improved Orchestration:** As a developer, I want the Main Agent to be fully in control of the final output.

## Technical Components

### Backend
- **Refactor Sub-Agents (`scheduler.ts`, `researcher.ts`):**
    - Remove the second LLM call (summarization).
    - Return the raw tool results (e.g., the JSON from Google Calendar or Tavily).
- **Update Main Agent (`main.ts`):**
    - Receive the raw results from the workers.
    - Perform the final summarization/streaming call.
- **Prompts:**
    - Update sub-agent prompts to focus on "Extract parameters and call tool".
    - Update Main Agent prompt to focus on "Synthesize worker results for the user".
