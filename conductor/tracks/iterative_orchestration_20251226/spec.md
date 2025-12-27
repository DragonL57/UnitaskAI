# Specification: Iterative Multi-Agent Orchestration

## Overview
Currently, the Main Agent performs a single round of delegation. To solve complex tasks (e.g., "Find a gap in my calendar and research a place for lunch then schedule it"), the agents need to communicate iteratively. The Main Agent should be able to loop, calling different agents based on previous outputs, until it has a final answer.

## User Stories
- **Multi-Step Tasks:** As a user, I want the bot to handle complex requests that require both research and scheduling in one go.
- **Collaborative Reasoning:** As a developer, I want to see the agents "talking" to each other to refine a plan before presenting it to me.

## Technical Components

### Backend
- **Main Agent Loop (`src/agents/main.ts`):**
    - Implement a `while` loop with a `maxRounds` limit (e.g., 5).
    - Maintain an `internalDialogue` array to track the messages between agents.
    - Each sub-agent call appends its report to the `internalDialogue`.
    - The LLM receives the `internalDialogue` in the next loop to decide on the next action.
- **Sub-Agent Responses:**
    - Refine sub-agent reports to clearly indicate if they are finished or need something else from the Main Agent.
- **Streaming:** Ensure only the *final* synthesis is streamed to the user (or optionally stream agent status updates).
