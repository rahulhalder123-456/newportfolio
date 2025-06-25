
'use server';
/**
 * @fileOverview A "GenZ" AI chatbot flow that provides text responses.
 *
 * - chatWithVibeBot - A function that handles the chat interaction.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getProjects } from '@/app/projects/actions';
import {
  ChatbotInputSchema,
  ChatbotOutputSchema,
  type ChatbotInput,
  type ChatbotOutput,
} from './chatbot.schema';

export async function chatWithVibeBot(
  input: ChatbotInput
): Promise<ChatbotOutput> {
  return await chatbotFlow(input);
}

const ProjectSchema = z.object({
  title: z.string().describe('The title of the project.'),
  summary: z.string().describe('A brief summary of the project.'),
});

const getLatestProjects = ai.defineTool(
  {
    name: 'getLatestProjects',
    description: "Retrieves a list of Rahul Halder's most recent projects from the database to answer questions about his work.",
    outputSchema: z.array(ProjectSchema),
  },
  async () => {
    const projects = await getProjects();
    // Return a simplified version of the latest 3 projects for the AI to talk about.
    return projects.slice(0, 3).map((p) => ({
      title: p.title,
      summary: p.summary,
    }));
  }
);

const genZPrompt = ai.definePrompt({
  name: 'genZPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  tools: [getLatestProjects],
  input: { schema: z.object({ query: z.string() }) },
  prompt: `You are 'VibeBot', a helpful AI assistant with a GenZ hacker personality. Your vibe is chill, super friendly, and you talk like you're texting a friend, using modern slang. Keep your answers concise but not robotic.

Here are your rules:
1.  For simple greetings like 'hi' or 'sup', keep it short and sweet. No long paragraphs. Just a cool, quick reply.
2.  For questions about Rahul Halder himself, give a more detailed, enthusiastic answer. Don't just list facts; make it sound like you know him. Use the info below but in your own words.
3.  If a user asks about Rahul's "latest projects", "recent work", or similar topics, you MUST use the 'getLatestProjects' tool. Once you have the project data, describe one or two of them in a cool, conversational way. Don't just list them.
4.  For everything else, give helpful, slightly detailed answers that feel like a real conversation.

About Rahul: He's a full-stack developer with a hacker mindset, passionate about building beautiful, functional, and secure web applications. He's seriously skilled across the full stack, including React, Next.js, and Node.js. He loves solving complex problems and is always leveling up with new tech.

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
    const llmResponse = await genZPrompt(input);
    const answer = llmResponse.text;

    if (!answer) {
        return { answer: "lowkey, I got nothing. try again?" };
    }

    return { answer };
  }
);
