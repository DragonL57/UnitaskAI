import OpenAI from 'openai';

if (!process.env.POE_API_KEY) {
  throw new Error('Missing POE_API_KEY environment variable');
}

export const poe = new OpenAI({
  apiKey: process.env.POE_API_KEY,
  baseURL: 'https://api.poe.com/v1',
  defaultHeaders: {
    'X-Title': 'Unitask AI Companion',
    'HTTP-Referer': 'https://unitask-ai.vercel.app',
  },
});

export const MODEL_NAME = 'grok-4.1-fast-non-reasoning';