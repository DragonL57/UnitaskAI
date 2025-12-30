# Plan: Search Tool Refactor & Consulter Agent Integration

This plan outlines the steps to refactor the search tool with DuckDuckGo primary and Tavily fallback, and to integrate a Consulter Agent for a refined "Critique Loop" response flow.

## Phase 1: Search Tool Refactor (Resilient Search)
- [x] Task: Research and select a reliable Node.js DuckDuckGo library (e.g., `ddgs` or `duck-duck-scrape`) 3fd5dea
- [ ] Task: Implement `src/tools/duckduckgo.ts` with basic search functionality
- [ ] Task: Refactor `src/agents/researcher.ts` to use DuckDuckGo as the primary engine
- [ ] Task: Implement retry logic in `Researcher` for "no results" (simplified keywords)
- [ ] Task: Implement fallback logic in `Researcher` to use Tavily if DuckDuckGo fails
- [ ] Task: Update `Researcher` to report explicit failures back to the Main Agent
- [ ] Task: Update `src/agents/main.ts` to handle search tool failures by answering from internal knowledge
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Search Tool Refactor (Resilient Search)' (Protocol in workflow.md)

## Phase 2: Consulter Agent Development
- [ ] Task: Create `src/agents/consulter.ts` defining the agent's logic and persona
- [ ] Task: Define the Consulter prompt in `src/prompts/consulter.ts` focusing on Completeness and Logic
- [ ] Task: Implement the Consulter calling logic in the `main` agent (Draft -> Critique -> Refined)
- [ ] Task: Ensure the Consulter receives the full conversation history and the draft answer
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Consulter Agent Development' (Protocol in workflow.md)

## Phase 3: UI Transparency & Integration
- [ ] Task: Update the `AgentActionLog` or message item UI to display the "Draft" and "Critique" steps
- [ ] Task: Ensure the final refined answer is displayed as the primary response
- [ ] Task: Run project-wide linting and type checking to ensure zero regressions
- [ ] Task: Conductor - User Manual Verification 'Phase 3: UI Transparency & Integration' (Protocol in workflow.md)
