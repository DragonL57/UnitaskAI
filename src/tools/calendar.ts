import { google } from 'googleapis';

console.log('Initializing Google Calendar Tool (GoogleAuth)...');

const client_email = process.env.GOOGLE_CLIENT_EMAIL;
let private_key = process.env.GOOGLE_PRIVATE_KEY;

if (private_key) {
  private_key = private_key.replace(/\\n/g, '\n').replace(/^"|"$/g, '');
}

if (!client_email || !private_key) {
  console.error('Missing Google Credentials!');
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email,
    private_key,
  },
  scopes: ['https://www.googleapis.com/auth/calendar'],
});

const calendar = google.calendar({ version: 'v3', auth });
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

export async function listEvents(timeMin: string = new Date().toISOString()) {
  try {
    const res = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin,
      maxResults: 15,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return res.data.items || [];
  } catch (error) {
    console.error('Error listing events:', error);
    throw error;
  }
}

export async function searchEvents(query: string, timeMin: string = new Date().toISOString()) {
  try {
    const res = await calendar.events.list({
      calendarId: CALENDAR_ID,
      q: query,
      timeMin,
      maxResults: 10,
      singleEvents: true,
    });
    return res.data.items || [];
  } catch (error) {
    console.error('Error searching events:', error);
    throw error;
  }
}

export async function createEvent(summary: string, start: string, end: string, description?: string) {
  try {
    const res = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      requestBody: {
        summary,
        description,
        start: { dateTime: start },
        end: { dateTime: end },
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

export async function updateEvent(eventId: string, summary?: string, start?: string, end?: string, description?: string) {
  try {
    const res = await calendar.events.patch({
      calendarId: CALENDAR_ID,
      eventId,
      requestBody: {
        ...(summary && { summary }),
        ...(description && { description }),
        ...(start && { start: { dateTime: start } }),
        ...(end && { end: { dateTime: end } }),
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

export async function deleteEvent(eventId: string) {
  try {
    await calendar.events.delete({
      calendarId: CALENDAR_ID,
      eventId,
    });
    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

export async function checkConflicts(start: string, end: string) {
  try {
    const res = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: start,
      timeMax: end,
      singleEvents: true,
    });
    return (res.data.items || []).length > 0;
  } catch (error) {
    console.error('Error checking conflicts:', error);
    throw error;
  }
}
