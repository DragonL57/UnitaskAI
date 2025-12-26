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
- **Persistent Memory System:** Use of advanced storage (like a vector database or structured data) to ensure the companion remembers user preferences and past interactions.

## Project Status
- **Core Implementation Complete:** The foundational multi-agent orchestration, Google Calendar integration, Tavily search, and persistent memory system are fully implemented and verified.
- **Context Awareness:** The chatbot now maintains conversation context within a session, allowing for follow-up questions and more natural dialogue.
- **Silent Memory:** The Memory Agent now acts as a background observer, autonomously identifying and saving user facts without explicit commands.
- **Code-Style Memory:** Memory is now stored in a human-readable Markdown file (`memory.md`), treating personal data as a "living document" that the AI edits.