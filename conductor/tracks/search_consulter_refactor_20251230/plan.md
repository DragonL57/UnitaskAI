# Plan: Search Tool Refactor & Consulter Agent Integration

This plan outlines the steps to refactor the search tool with DuckDuckGo primary and Tavily fallback, and to integrate a Consulter Agent for a refined "Critique Loop" response flow.

## Phase 1: Search Tool Refactor (Resilient Search) [checkpoint: 2345cba]
- [x] Task: Research and select a reliable Node.js DuckDuckGo library (e.g., `ddgs` or `duck-duck-scrape`) 3fd5dea
- [x] Task: Implement `src/tools/duckduckgo.ts` with basic search functionality c0d8d3a
- [x] Task: Refactor `src/agents/researcher.ts` to use DuckDuckGo as the primary engine 7881178
- [x] Task: Implement retry logic in `Researcher` for "no results" (simplified keywords) 7881178
- [x] Task: Implement fallback logic in `Researcher` to use Tavily if DuckDuckGo fails 7881178
- [x] Task: Update `Researcher` to report explicit failures back to the Main Agent 7881178
- [x] Task: Update `src/agents/main.ts` to handle search tool failures by answering from internal knowledge 7ec5f96
- [x] Task: Conductor - User Manual Verification 'Phase 1: Search Tool Refactor (Resilient Search)' (Protocol in workflow.md) 2345cba

## Phase 2: Consulter Agent Development
- [x] Task: Create `src/agents/consulter.ts` defining the agent's logic and persona a0af617
- [x] Task: Define the Consulter prompt in `src/prompts/consulter.ts` focusing on Completeness and Logic a0af617
- [x] Task: Implement the Consulter calling logic in the `main` agent (Draft -> Critique -> Refined) 11b8603
- [x] Task: Ensure the Consulter receives the full conversation history and the draft answer 11b8603
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Consulter Agent Development' (Protocol in workflow.md)

## Phase 3: UI Transparency & Integration
- [x] Task: Update the `AgentActionLog` or message item UI to display the "Draft" and "Critique" steps 9a3b141
- [x] Task: Ensure the final refined answer is displayed as the primary response 11b8603
- [x] Task: Run project-wide linting and type checking to ensure zero regressions VERIFIED
## Phase 4: Switch to Brave Search API (Repair) [checkpoint: 616f42a]
- [x] Task: Create `src/tools/brave-search.ts` using Brave Web Search API b6c4f92
- [x] Task: Refactor `src/agents/researcher.ts` to use Brave Search as primary engine fbf9117
- [x] Task: Conductor - User Manual Verification 'Phase 4: Switch to Brave Search API' (Protocol in workflow.md)
