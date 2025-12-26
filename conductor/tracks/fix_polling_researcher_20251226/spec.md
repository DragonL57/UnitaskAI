# Specification: Fix Polling & Researcher Response

## Overview
1.  **Memory UI:** Remove the `setInterval` polling. The UI should only update on page load or when explicit actions occur (manual refresh).
2.  **Researcher Agent:** Debug and fix the issue where the agent returns an empty string despite performing a search.

## Technical Components

### Frontend (`src/components/MemoryManager.tsx`)
- Remove `useEffect` interval.
- Add back a manual "Refresh" button (user request implied "stop polling", manual refresh is a safe fallback).

### Backend (`src/agents/researcher.ts`)
- Log the `secondResponse` from the LLM.
- Ensure the `toolResult` passed to the LLM is stringified correctly and not too large (truncating if necessary).
