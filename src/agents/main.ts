import { poe, MODEL_NAME } from '@/lib/poe';
import { readMemory, addOrUpdateMemory } from '@/agents/memory';
import { handleSchedulerRequest } from '@/agents/scheduler';
import { handleResearcherRequest } from '@/agents/researcher';
import { MAIN_COMPANION_PROMPT } from '@/prompts/main';

export async function chat(userQuery: string) {
  // 1. Read Memory
  const memoryEntries = await readMemory();
  const memoryString = memoryEntries
    .map(m => `- ${m.key}: ${JSON.stringify(m.value)}`)
    .join('\n');

  // 2. Prepare System Prompt
  const systemPrompt = MAIN_COMPANION_PROMPT
    .replace('{{memory}}', memoryString || 'No memory yet.')
    .replace('{{currentTime}}', new Date().toISOString());

  // 3. Initial Classification/Response from Main Agent
  const response = await poe.chat.completions.create({
    model: MODEL_NAME,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userQuery },
    ],
  });

  const mainResponse = response.choices[0].message.content;

  // 4. Logic to decide if we need to call other agents 
  // (In a real implementation, we'd use function calling or more rigorous parsing)
  // For this prototype, we'll look for keywords as a simple routing mechanism.
  
  let finalResponse = mainResponse;

  if (userQuery.toLowerCase().includes('schedule') || userQuery.toLowerCase().includes('calendar')) {
    const schedulerOutput = await handleSchedulerRequest(userQuery);
    finalResponse = `[Scheduler Active] ${schedulerOutput}`;
  } else if (userQuery.toLowerCase().includes('search') || userQuery.toLowerCase().includes('find') || userQuery.toLowerCase().includes('http')) {
    const researcherOutput = await handleResearcherRequest(userQuery);
    finalResponse = `[Researcher Active] ${researcherOutput}`;
  }

  // 5. Silent Memory Update (Simple heuristic for now)
  // If the user says "remember X", we'll store it.
  if (userQuery.toLowerCase().startsWith('remember')) {
    const parts = userQuery.split(' ');
    if (parts.length > 2) {
      const key = parts[1];
      const value = parts.slice(2).join(' ');
      await addOrUpdateMemory(key, value, 'fact');
    }
  }

  return finalResponse;
}
