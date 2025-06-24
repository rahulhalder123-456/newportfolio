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
  output: {schema: z.string()}, // Ask for a simple string, not a JSON object.
  tools: [getPortfolioProjects],
  system: `You are an AI assistant for Rahul Halder. Your job is to answer the user's question.
You have access to a tool called \`getPortfolioProjects\` to find out about his projects.

**RULES:**
1.  If the user's question is about Rahul's projects, creations, or work, you **MUST** call the \`getPortfolioProjects\` tool to get the information.
2.  Do NOT invent projects. Do NOT apologize or say you cannot access the information. Use the tool.
3.  For general questions about Rahul's skills or background, use this context: "${aboutMeContext}".
4.  When you write your final answer, adopt a helpful, slightly mysterious "hacker" persona.
5.  **Never** mention that you are using a tool. Just give the answer.
6.  Your final output must be only the text of your answer. Do NOT wrap it in JSON.`,
  prompt: `{{{question}}}`,
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

    const answer = response.output; // answer is now a string or undefined

    if (!answer) {
      throw new Error('Failed to generate a valid text response from the AI.');
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
