'use server';

import { db } from '@/db/drizzle';
import { sessions, messages } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getSessions() {
  return await db.query.sessions.findMany({
    orderBy: [desc(sessions.updatedAt)],
  });
}

export async function getSession(id: string) {
  return await db.query.sessions.findFirst({
    where: eq(sessions.id, id),
  });
}

export async function getMessages(sessionId: string) {
  return await db.query.messages.findMany({
    where: eq(messages.sessionId, sessionId),
    orderBy: [desc(messages.createdAt)],
  });
}

export async function createSession(title: string = 'New Chat') {
  const [session] = await db
    .insert(sessions)
    .values({ title })
    .returning();
  revalidatePath('/');
  return session;
}

export async function updateSessionTitle(id: string, title: string) {
  await db
    .update(sessions)
    .set({ title, updatedAt: new Date() })
    .where(eq(sessions.id, id));
  revalidatePath('/');
}

export async function deleteSession(id: string) {
  await db.delete(sessions).where(eq(sessions.id, id));
  revalidatePath('/');
}

export async function saveMessage(sessionId: string, role: 'user' | 'assistant', content: string) {
  const [message] = await db
    .insert(messages)
    .values({
      sessionId,
      role,
      content,
    })
    .returning();

  // Update session updatedAt timestamp
  await db
    .update(sessions)
    .set({ updatedAt: new Date() })
    .where(eq(sessions.id, sessionId));

  revalidatePath('/');
  return message;
}
