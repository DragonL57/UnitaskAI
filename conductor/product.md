# Initial Concept

I want to build a multiagent chatbot companion that have access to google calendar, websearch and webpage read tool and have memory

# Product Vision
To create a sophisticated multi-agent chatbot companion that acts as a proactive personal assistant, seamlessly integrating schedule management, real-time research, and long-term memory to support users in their professional, academic, and daily lives.

# Target Audience
- **General Users:** Individuals seeking an intelligent companion for daily task management and information retrieval.
- **Professionals:** Busy individuals needing assistance with complex scheduling, research, and keeping track of professional commitments.
- **Students:** Learners requiring support with study organization, research assistance, and information synthesis.

# Core Goals
- **Proactive Assistance:** Integrate Google Calendar and research tools to provide a seamless, forward-looking assistant experience.
- **Comprehensive Research:** Enable deep dives into information through efficient web searches and detailed webpage analysis/summarization.
- **Personalized Context:** Implement a persistent memory system to maintain long-term context, recall preferences, and deliver personalized interactions.

# Key Features
- **Multi-Agent Architecture:** A specialized system featuring dedicated agents (e.g., Scheduler Agent, Researcher Agent, and a Main Companion Agent) for optimized task execution.
- **Google Calendar Integration:** Full capability to read existing events, schedule new appointments, and provide timely reminders.
- **Tavily Integration:** Utilization of Tavily for high-performance web search and webpage content extraction, ensuring accurate and relevant information retrieval.
- **Deep Reasoning Memory:** A persistent memory system where a dedicated agent performs "Sleep-time Compute" to consolidate facts and infer user habits over time.
- **Interactive Transparency:** A sophisticated background process log that allows users to visualize the multi-agent orchestration, complete with interactive search result pills and a chronological timeline of actions.

## Project Status
- **Core Implementation Complete:** The foundational multi-agent orchestration, Google Calendar integration, Tavily search, and persistent memory system are fully implemented and verified.
- **Context Awareness:** The chatbot now maintains conversation context within a session, allowing for follow-up questions and more natural dialogue.
- **Silent Memory:** The Memory Agent now acts as a background observer, autonomously identifying and saving user facts without explicit commands.
- **Code-Style Memory:** Memory is now stored in a human-readable Markdown file (`memory.md`), treating personal data as a "living document" that the AI edits.
- **Explicit Delegation:** The Main Agent now uses a manager-worker pattern, generating clear, specific instructions for specialized agents rather than passing raw queries.
- **Researcher Performance:** The Researcher Agent now consistently delivers summaries for up to 10 search results using a robust manual injection architecture.
- **Advanced Scheduling:** The assistant can now search, update, and delete Google Calendar events, enabling full lifecycle management of the user's schedule.
- **Sleep-time Compute:** The Memory Agent now operates as a reasoning worker, performing iterative, offline consolidation to refine its understanding of the user.
- **Interactive Transparency Log:** The UI now features a minimalistic, box-styled "Steps Taken" log that is individually collapsible and displays search results as interactive pills.
- **Temporal Awareness:** The system is now fully aware of the user's local time (UTC+7, Vietnam Time), ensuring accurate scheduling and context.