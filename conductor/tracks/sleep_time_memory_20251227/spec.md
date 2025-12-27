# Specification: Sleep-time Compute for Memory

## Overview
Based on the research "Sleep-time Compute", we will transform the Memory Agent from a simple observer into a reasoning worker that "thinks" offline. After every user message, the agent will enter a loop to reorganize and consolidate memories, drawing new insights and hypotheses to better serve the user in future queries.

## User Stories
- **Deep Personalization:** As a user, I want the bot to not just remember facts, but to understand my underlying habits and needs (e.g., inferring a preference for afternoon meetings because I mention being busy in the mornings).
- **Consolidated Knowledge:** As a developer, I want the memory file to be clean, organized, and free of redundant or conflicting information.

## Technical Components

### Backend
- **Memory Agent Reasoning Loop (`src/agents/memory.ts`):**
    - Implement a `while` loop (up to 10 rounds).
    - Maintain a `workingMemory` string.
    - **Tools:**
        - `rethink_memory(new_content: string)`: Updates the `workingMemory`.
        - `finish_rethinking()`: Breaks the loop and saves the `workingMemory` to Vercel Blob.
- **Prompts (`src/prompts/memory.ts`):**
    - Transition to "Letta-Offline-Memory" style instructions.
    - Emphasize pattern recognition, hypothesis generation, and consolidation.
