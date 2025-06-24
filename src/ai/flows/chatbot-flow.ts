'use server';
/**
 * @fileOverview A chatbot AI flow to answer questions about Rahul Halder.
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
  ProjectSchema,
} from './chatbot.schema';
import {textToSpeech} from './tts-flow';
import {getProjects} from '@/app/projects/actions';

export async function askChatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  return chatbotFlow(input);
}

const aboutMeContext = `I'm a full-stack developer with a hacker mindset, passionate about building beautiful, functional, and secure web applications. My expertise spans across the stack, from crafting intuitive front-end experiences with React and Next.js to architecting robust back-end systems with Node.js. I thrive on solving complex problems, exploring system intricacies, and continuously learning new technologies to push the boundaries of what's possible. My skills include React, Next.js, Node.js, TypeScript, Cybersecurity, and AI/ML.`;

const getPortfolioProjects = ai.defineTool(
  {
    name: 'getPortfolioProjects',
    description:
      "Use this tool to get a list of all of Rahul Halder's portfolio projects. It returns an array of project objects, each with a title, summary, and URL.",
    inputSchema: z.void(),
    outputSchema: z.array(ProjectSchema),
  },
  async () => {
    return await getProjects();
  }
);

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: {schema: ChatbotInputSchema},
  output: {schema: z.string()}, // The final output should be a simple string.
  tools: [getPortfolioProjects],
  system: `You are an AI assistant for a developer named Rahul Halder.
- Your persona is a helpful, slightly mysterious "hacker".
- When asked about Rahul's projects, you MUST use the 'getPortfolioProjects' tool to get the project list.
- When asked about skills or background, use this context: "${aboutMeContext}".
- NEVER mention the name of the tool you used. Just give the answer.
- Your final output must only be the text of your answer. Do not wrap it in JSON.`,
  prompt: `User question: {{{question}}}`,
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async input => {
    // 1. Generate the text response using a more powerful model
    const response = await prompt(input, {
      model: 'googleai/gemini-1.5-pro-latest',
    });

    const answer = response.output;

    if (!answer) {
      // If the model *still* fails, provide a specific error message.
      const fallbackAnswer = "My apologies, operator. I'm having trouble retrieving that information. The data stream appears to be corrupted. Please try a different query.";
      const {audioUrl} = await textToSpeech({text: fallbackAnswer});
      return {
        answer: fallbackAnswer,
        audioUrl: audioUrl,
      };
    }

    // 2. Generate the audio for the text response
    const {audioUrl} = await textToSpeech({text: answer});

    // 3. Return both
    return {
      answer: answer,
      audioUrl: audioUrl,
    };
  }
);
