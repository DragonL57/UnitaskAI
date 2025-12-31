# Specification: Explicit Agent Delegation

## Overview
The current architecture often passes the user's raw query directly to sub-agents. We want to shift to a model where the Main Agent acts as a true orchestrator, analyzing the request and context to generate **specific, refined instructions** for the sub-agents (e.g., "User asked for calendar; instruct Scheduler to list events for today").

## User Stories
- **Better Accuracy:** As a user, I want the bot to understand "next Friday" correctly and pass the specific date to the calendar agent.
- **Clearer Logic:** As a developer, I want to see the Main Agent explicitly constructing tasks for sub-agents.

## Technical Components

### Backend
- **Main Agent (`src/agents/main.ts`):**
    - Update tool definitions to require `instruction` instead of `query`.
    - `delegateToScheduler(instruction: string)`
    - `delegateToResearcher(instruction: string)`
- **Prompts (`src/prompts/main.ts`):**
    - instruct the Main Agent to REWRITE the user's intent into a clear command for the specialized agent.
- **Sub-Agents (`src/agents/scheduler.ts`, `src/agents/researcher.ts`):**
    - Update logic/variable names to reflect that they are receiving an `instruction`, not a raw user query.
