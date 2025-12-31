# Specification: Advanced Calendar CRUD Operations

## Overview
Currently, the Scheduler Agent can only list, create, and check for conflicts. To be a true personal assistant, it must be able to update existing events (e.g., reschedule), delete events, and search for specific events by title or content.

## User Stories
- **Rescheduling:** As a user, I want to say "Reschedule my 2 PM meeting to 4 PM" and have the bot handle it.
- **Cancellation:** As a user, I want to say "Cancel my dentist appointment" and have the bot delete it.
- **Specific Search:** As a user, I want to say "When is my next flight?" and have the bot find the specific event.

## Technical Components

### Backend
- **Calendar Tools (`src/tools/calendar.ts`):**
    - `updateEvent(eventId, updateData)`: Patch an existing event.
    - `deleteEvent(eventId)`: Remove an event.
    - `searchEvents(query, timeMin)`: List events matching a text query.
- **Scheduler Agent (`src/agents/scheduler.ts`):**
    - Expose `updateEvent`, `deleteEvent`, and `searchEvents` via the tool-calling interface.
    - Refine prompt to handle multi-step actions (e.g., search for event ID first, then update/delete).
