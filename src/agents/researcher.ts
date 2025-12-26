import { poe, MODEL_NAME } from '@/lib/poe';
import { search, readWebpage } from '@/tools/tavily';
import { RESEARCHER_PROMPT } from '@/prompts/researcher';

export async function handleResearcherRequest(userQuery: string) {
  const response = await poe.chat.completions.create({
    model: MODEL_NAME,
    messages: [
      { role: 'system', content: RESEARCHER_PROMPT },
      { role: 'user', content: userQuery },
    ],
  });

  return response.choices[0].message.content;
}
