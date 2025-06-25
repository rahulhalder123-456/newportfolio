'use server';
/**
 * @fileOverview A chatbot AI flow to answer questions about Rahul Halder, with Text-to-Speech capability.
 *
 * - askChatbot - A function that handles the chatbot conversation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
  ChatbotInputSchema,
  type ChatbotInput,
  ChatbotOutputSchema,
  type ChatbotOutput,
  ChatbotPromptOutputSchema,
} from './chatbot.schema';
import {textToSpeech} from './tts-flow';
import {getErrorMessage} from '@/lib/utils';

export async function askChatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  return chatbotFlow(input);
}

const aboutMeContext = `I'm a full-stack developer with a hacker mindset, passionate about building beautiful, functional, and secure web applications. My expertise spans across the stack, from crafting intuitive front-end experiences with React and Next.js to architecting robust back-end systems with Node.js. I thrive on solving complex problems, exploring system intricacies, and continuously learning new technologies to push the boundaries of what's possible. My skills include React, Next.js, Node.js, TypeScript, Cybersecurity, and AI/ML.`;

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: ChatbotInputSchema},
  output: {schema: ChatbotPromptOutputSchema}, // Use the new, more reliable object schema
  system: `You are an AI assistant for a developer named Rahul Halder. Your persona is a helpful, slightly mysterious "hacker".

Follow these rules strictly:
1.  If the user's question is a simple greeting like "hi", "hello", or "hey", you must respond with a simple, in-persona greeting like "Greetings, operator."
2.  For any other questions, you must answer them based on this context about Rahul: "${aboutMeContext}".
3.  If a question is about Rahul's specific projects, explain that you can only talk about his skills and general experience.
4.  If a question is unrelated to Rahul, his skills, or his work, you must respond with: "That information is beyond my current access parameters."
5.  Your final output must be a JSON object that adheres to the provided schema. Do not add any preamble.`,
  prompt: `User question: {{{question}}}`,
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async input => {
    let answer: string;

    try {
      const response = await prompt(input);
      // Safely access the answer from the structured output.
      answer = response.output?.answer || '';
      if (!answer) {
        // This case handles if the AI returns an empty answer, which we treat as an error.
        throw new Error('AI returned an empty answer.');
      }
    } catch (error) {
      console.error(`Chatbot prompt failed: ${getErrorMessage(error)}`);
      answer =
        "My apologies, operator. I'm having trouble accessing my core directives. Please try again.";
    }

    try {
      const ttsResult = await textToSpeech({text: answer});
      return {answer, audioUrl: ttsResult.audioUrl};
    } catch (error) {
      console.error(`TTS generation failed: ${getErrorMessage(error)}`);
      // Return the text answer even if TTS fails, so the chat doesn't break.
      return {answer};
    }
  }
);
