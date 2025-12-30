import { config } from 'dotenv';
config({ path: '.env' });
import { db } from '../db/drizzle';
import { sessions } from '../db/schema';

async function checkSessions() {
  try {
    const allSessions = await db.select().from(sessions);
    console.log('Sessions in DB:', allSessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
  }
}

checkSessions();
