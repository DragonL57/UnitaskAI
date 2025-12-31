# Specification: Sub-Agent Iterative Tool Calling

## Overview
Sub-agents (Scheduler, Researcher) currently only support a single round of tool usage. This track refactors them to include a reasoning loop, enabling them to execute multiple tools in sequence (e.g., Search -> Analysis -> Update) within a single request from the Main Agent.

## User Stories
- **Complex Sub-Tasks:** As a user, I want the scheduler to find a specific event and delete it without the Main Agent having to ask me for more details.
- **Autonomous Specialists:** As a developer, I want my specialists to be smarter and more autonomous in how they use their tools.

## Technical Components

### Backend
- **Scheduler Agent (`src/agents/scheduler.ts`):**
    - Implement a `while` loop for tool execution.
    - Accumulate tool results in the message history for the duration of the request.
- **Researcher Agent (`src/agents/researcher.ts`):**
    - Implement a `while` loop for tool execution.
    - Enable sequential searching or reading of multiple pages.
- **Prompts:**
    - Update Specialist prompts to encourage multi-step tool usage to fulfill the Main Agent's instruction.
