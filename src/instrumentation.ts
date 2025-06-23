import { configureGenkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { config } from 'dotenv';

export async function register() {
  // Load environment variables from .env file
  config();

  // Conditionally configure Genkit only if the API key is provided.
  // This prevents the server from crashing on startup if the key is missing.
  if (process.env.GEMINI_API_KEY) {
    configureGenkit({
      plugins: [googleAI({ apiKey: process.env.GEMINI_API_KEY })],
      enableTracingAndMetrics: true,
    });
  }
}
