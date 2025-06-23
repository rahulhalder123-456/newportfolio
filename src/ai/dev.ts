import { config } from 'dotenv';
config();

import { configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Conditionally configure Genkit only if the API key is provided.
// This prevents the server from crashing on startup if the key is missing.
if (process.env.GEMINI_API_KEY) {
  configureGenkit({
    plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
    logLevel: 'debug',
    enableTracingAndMetrics: true,
  });
}

// Import flows after potential configuration.
import '@/ai/flows/summarize-github-repo.ts';
