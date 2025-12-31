# Specification: Debug Researcher & Scale

## Overview
The Researcher Agent is returning a 0-length response despite getting valid tool results. We need to log the exact output from the tool and the LLM response to identify the bottleneck. We will also increase the search results to 10.

## Technical Components

### Backend
- **Researcher Agent (`src/agents/researcher.ts`):**
    - Log the raw `toolResult` (truncated).
    - Log the full `secondResponse` object to check for errors or refusal.
    - Implement a fallback summarization call if the standard tool flow fails.
- **Tavily Tool (`src/tools/tavily.ts`):**
    - Increase `max_results` to 10.
