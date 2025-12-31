# Specification: Stop Generation Button

## Overview
Add a button to the UI that allows the user to immediately halt the AI's response generation. This improves user control and saves compute resources when a response is no longer desired.

## User Stories
- **Interrupt Long Responses:** As a user, I want to stop the bot if it's generating a very long response that I've already understood or that is going in the wrong direction.
- **Save Time:** As a user, I want to quickly cancel a request if I made a typo or changed my mind.

## Technical Components

### Frontend (`src/components/Chat.tsx`)
- **AbortController:** Implement `AbortController` to cancel the `fetch` request to `/api/chat`.
- **UI State:**
    - Add a `stopRef` or state to store the current `AbortController`.
    - Replace the "Send" button with a "Stop" button (Square icon) when `isLoading` is true.
    - Ensure `isLoading` and `isReceivingContent` are reset to `false` when stopped.

### Backend (`src/app/api/chat/route.ts`)
- The server should naturally stop processing when the client disconnects the stream, but we should ensure the `ReadableStream` handle the cancellation gracefully.
