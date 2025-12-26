import { google } from 'googleapis';

console.log('Initializing Google Calendar Tool (Explicit Auth)...');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const privateKey = process.env.GOOGLE_PRIVATE_KEY
  ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  privateKey,
  SCOPES
);

const calendar = google.calendar({ version: 'v3' });
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

async function getAuthClient() {
  await auth.authorize();
  return auth;
}

export async function listEvents(timeMin: string = new Date().toISOString()) {
  try {
    const authClient = await getAuthClient();
    const res = await calendar.events.list({
      auth: authClient,
      calendarId: CALENDAR_ID,
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
    const authClient = await getAuthClient();
    const res = await calendar.events.insert({
      auth: authClient,
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

export async function checkConflicts(start: string, end: string) {
  try {
    const authClient = await getAuthClient();
    const res = await calendar.events.list({
      auth: authClient,
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
