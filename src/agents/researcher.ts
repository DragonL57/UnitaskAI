import { poe, MODEL_NAME } from '@/lib/poe';
import { search as _search, readWebpage as _readWebpage } from '@/tools/tavily';
import { RESEARCHER_PROMPT } from '@/prompts/researcher';

export async function handleResearcherRequest(userQuery: string) {
  // Tools available for future complex logic: search, readWebpage
  console.log('Researcher using tools for query:', userQuery);
  
  const response = await poe.chat.completions.create({
    model: MODEL_NAME,
    messages: [
      { role: 'system', content: RESEARCHER_PROMPT },
      { role: 'user', content: userQuery },
    ],
  });

  return response.choices[0].message.content;
}
