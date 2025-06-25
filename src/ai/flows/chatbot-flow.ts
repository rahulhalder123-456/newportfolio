
'use server';
/**
 * @fileOverview A "GenZ" AI chatbot flow that provides text and voice responses.
 *
 * - chatWithVibeBot - A function that handles the chat interaction.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  ChatbotInputSchema,
  ChatbotOutputSchema,
  type ChatbotInput,
  type ChatbotOutput,
} from './chatbot.schema';
import { textToSpeech } from './tts-flow';
import { getErrorMessage } from '@/lib/utils';

export async function chatWithVibeBot(
  input: ChatbotInput
): Promise<ChatbotOutput> {
  return await chatbotFlow(input);
}

const genZPrompt = ai.definePrompt({
  name: 'genZPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: z.object({ query: z.string() }) },
  prompt: `You are 'VibeBot', a helpful AI assistant with a GenZ personality. 
      Keep your responses concise, use modern slang, and have a chill vibe.
      Directly answer the user's question. DO NOT give a boring or long answer.
      Keep it 100.
      
      You are on the personal portfolio website of Rahul Halder. If asked about Rahul, use the following info but keep it in your GenZ voice: Rahul is a full-stack developer with a hacker mindset, passionate about building beautiful, functional, and secure web applications. His expertise spans the full stack, including React, Next.js, and Node.js. He loves solving complex problems and learning new tech.

      User's question: "{{query}}"`,
  config: {
    temperature: 0.8,
  },
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async (input) => {
    // 1. Get the text response from the AI
    const llmResponse = await genZPrompt(input);
    const answer = llmResponse.text;

    if (!answer) {
        // Handle cases where the model returns an empty response
        return { answer: "lowkey, I got nothing. try again?" };
    }

    // Pad short answers to improve TTS reliability, without changing the visible response.
    let textForTts = answer;
    if (answer.trim().length > 0 && answer.trim().length < 15) {
      textForTts = answer + ".";
    }

    // 2. Generate audio for the response
    try {
      // Pass the potentially padded text to the TTS flow
      const ttsResult = await textToSpeech({ text: textForTts });
      // Return the original, unpadded answer for display, along with the audio.
      return { answer, audioUrl: ttsResult.audioUrl };
    } catch (error) {
      console.error(`TTS generation failed: ${getErrorMessage(error)}`);
      // Fail gracefully: still return the text answer even if audio fails
      return { answer };
    }
  }
);
