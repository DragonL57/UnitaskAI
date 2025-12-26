# Specification: Resolve Final Linting & Type Issues

## Overview
The goal is to achieve a clean `pnpm lint` report by addressing specific TypeScript strictness rules and removing unused code identified in the latest audit.

## Tasks
1.  **Main Agent (`src/agents/main.ts`):** Add descriptions to `@ts-expect-error`.
2.  **Memory Agent (`src/agents/memory.ts`):** Remove unused `_history` parameter.
3.  **Researcher/Scheduler Agents:** Add descriptions to `@ts-expect-error`.
4.  **Route Handler (`src/app/api/chat/route.ts`):** Convert `@ts-ignore` to `@ts-expect-error` with description.
5.  **Home Page (`src/app/page.tsx`):** Remove unused `_setActiveAgent` state.
6.  **Chat Component (`src/components/Chat.tsx`):** 
    - Remove unused icon imports (`Loader2`, `Calendar`, `Search`, `Database`).
    - Remove unused `sendChatMessage` and `activeAgent` local state (now managed in props/upstream).
    - Properly type agent name casting.
7.  **Memory Manager (`src/components/MemoryManager.tsx`):** Remove unused `Database` icon.
