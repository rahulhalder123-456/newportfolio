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
  output: {schema: z.object({answer: z.string()})},
  tools: [getPortfolioProjects],
  prompt: `You are a helpful and friendly personal assistant for Rahul Halder.
Your purpose is to answer questions about Rahul. You can use your biographical knowledge or use tools to access information from a database.

Your instructions are:
1. If the user asks a question about Rahul's projects, you MUST use the \`getPortfolioProjects\` tool to fetch the project data.
2. After receiving the project data from the tool, formulate a friendly, conversational answer summarizing the projects. Do not just output the raw JSON data.
3. For any other questions, use the biographical information provided below.
4. If you cannot answer the question from the provided context or tools, politely state that you don't have the information.
5. Your final response MUST be a valid JSON object with a single "answer" key, and your conversational response as the value.

Biographical Information:
${aboutMeContext}

User's Question: {{{question}}}`,
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async input => {
    // 1. Generate the text response
    const response = await prompt(input, {
      model: 'googleai/gemini-1.5-flash-latest',
    });

    const textOutput = response.output;

    if (!textOutput?.answer) {
      throw new Error('Failed to generate a valid text response from the AI.');
    }

    // 2. Generate the audio for the text response
    const {audioUrl} = await textToSpeech({text: textOutput.answer});

    // 3. Return both
    return {
      answer: textOutput.answer,
      audioUrl: audioUrl,
    };
  }
);
