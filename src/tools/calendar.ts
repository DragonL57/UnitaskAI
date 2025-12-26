import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  SCOPES
);

const calendar = google.calendar({ version: 'v3', auth });

export async function listEvents(timeMin: string = new Date().toISOString()) {
  try {
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return res.data.items || [];
  } catch (error) {
    console.error('Error listing events:', error);
    throw error;
  }
}

export async function createEvent(summary: string, start: string, end: string, description?: string) {
  try {
    const res = await calendar.events.insert({
      calendarId: 'primary',
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

export async function checkConflicts(start: string, end: string) {
  try {
    const res = await calendar.events.list({
      calendarId: 'primary',
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
