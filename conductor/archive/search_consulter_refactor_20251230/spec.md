# Specification: Search Tool Refactor & Consulter Agent Integration

## 1. Overview
This track involves two major architectural enhancements:
1.  **Resilient Search Logic:** Refactoring the search capability to use DuckDuckGo as the primary engine with Tavily as a fallback, including robust error reporting and retry logic.
2.  **Critique Loop (Consulter Agent):** Introducing a new agent that critiques the Main Agent's draft response based on conversation context and specific frameworks (Completeness and Logic) before a final refined answer is produced.

## 2. Functional Requirements

### 2.1 Resilient Search (Researcher Agent)
- **Primary Tool:** Implement DuckDuckGo search using a reliable Node.js library (e.g., `duckduckgo-search` or `ddgs`).
- **Fallback Logic:**
    - If DuckDuckGo fails (network error/rate limit), automatically fallback to **Tavily**.
    - If DuckDuckGo returns **zero results**, retry the search with a simplified, keyword-based query.
- **Error Reporting:** If both DuckDuckGo and Tavily fail, the Researcher Agent must explicitly report the failure to the Main Agent.
- **Main Agent Fallback:** Upon receiving a search failure report, the Main Agent must inform the user of the tool failure and provide an answer based solely on its internal training data (internal knowledge).

### 2.2 Consulter Agent (Critique Loop)
- **Role:** Acts as a quality controller for the Main Agent's responses.
- **Input:** Receives the **full conversation history**, the original user prompt, and the Main Agent's **draft answer**.
- **Critique Framework:**
    - **Completeness:** Did the draft answer address every part of the user's query?
    - **Logical Consistency:** Are there any contradictions or logical fallacies in the draft?
- **Process Flow:**
    1. Main Agent generates a `draft_answer` after gathering tool results.
    2. Consulter Agent analyzes `draft_answer` and provides a `critique`.
    3. Main Agent receives `critique` and generates the `final_answer`.
- **Transparency:** The user should be able to see the draft and the critique (e.g., within the "Thought/Action Log" or a collapsible section), while the final answer is presented as the primary response.

## 3. Non-Functional Requirements
- **Performance:** The critique loop should be optimized to minimize latency.
- **Reliability:** Tool errors must be caught gracefully without crashing the chat session.
- **Observability:** Logs should clearly distinguish between DuckDuckGo and Tavily attempts.

## 4. Acceptance Criteria
- [ ] DuckDuckGo is the first search tool used.
- [ ] Tavily is successfully used as a fallback when DuckDuckGo fails.
- [ ] A "no results" scenario triggers a simplified keyword retry.
- [ ] The Main Agent successfully answers from internal knowledge when search tools fail.
- [ ] The Consulter Agent correctly identifies missing points or logical flaws in a draft.
- [ ] The user can see the "Draft -> Critique -> Refined Answer" flow in the UI.

## 5. Out of Scope
- Refactoring non-search tools (Memory, Calendar).
- Multi-turn debates between agents (limited to single-pass critique for now).
