# Specification: Fix Researcher & Memory

## Overview
This track addresses two distinct issues:
1.  **Researcher Agent:** Fails with `Bad Request` when calling Tavily. We need to validate the input instruction and ensure the query is well-formed.
2.  **Memory Agent:** Logs are too noisy due to polling. We need to silence the "read" logs and ensure it actually saves new facts.

## Technical Components

### Backend
- **Researcher Agent (`src/agents/researcher.ts`):**
    - Add logging to see exactly what `instruction` is passed and what `query` is generated.
    - Handle empty/null instructions gracefully.
- **Memory Agent (`src/agents/memory.ts`):**
    - Remove/Silence "Attempting to read..." logs.
    - Debug why `evaluateAndStore` returns `NO_UPDATE`.
- **Tavily Tool (`src/tools/tavily.ts`):**
    - Log the payload sent to Tavily (excluding API key) to debug the Bad Request.
