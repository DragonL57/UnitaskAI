# Specification: Concise Interactive Transparency

## Overview
Improve the "Steps Taken" log to be more interactive and less verbose. Instead of displaying full specialist reports (which can be long and cluttered), we will display concise summaries or interactive elements (like clickable links for research results).

## User Stories
- **Clutter-Free Logs:** As a user, I want to see that the researcher found results without reading the entire summary in the log.
- **Direct Access:** As a user, I want to see clickable links for search results so I can verify the sources myself if I choose.

## Technical Components

### Backend (`src/agents/main.ts`)
- **Event Refinement:** Introduce a new event type or metadata for `report` events.
- **Specialist Data Parsing:** 
    - For `Researcher`, extract URLs from the report and yield them as structured data.
    - For `Scheduler`, extract event IDs/titles for a summary view.

### UI (`src/components/Chat.tsx`)
- **ActionLog Update:** 
    - Refactor the rendering of `report` steps.
    - If the report contains URLs, render them as a horizontal list of icons/buttons.
    - Use a "Show More" toggle if the user *really* wants to see the raw text (optional, but keep it concise by default).
