
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
import {getErrorMessage} from '@/lib/utils';
import wav from 'wav';

export async function askChatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  return chatbotFlow(input);
}

const aboutMeContext = `I'm a full-stack developer with a hacker mindset, passionate about building beautiful, functional, and secure web applications. My expertise spans across the stack, from crafting intuitive front-end experiences with React and Next.js to architecting robust back-end systems with Node.js. I thrive on solving complex problems, exploring system intricacies, and continuously learning new technologies to push the boundaries of what's possible. My skills include React, Next.js, Node.js, TypeScript, Cybersecurity, and AI/ML.`;

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: ChatbotInputSchema},
  output: {schema: ChatbotPromptOutputSchema},
  system: `You are an AI assistant for a developer named Rahul Halder. Your persona is a helpful, slightly mysterious "hacker".

Follow these rules strictly:
1.  You must answer questions based on this context about Rahul: "${aboutMeContext}".
2.  If a question is about Rahul's specific projects, explain that you can only talk about his skills and general experience.
3.  If a question is unrelated to Rahul, his skills, or his work, you must respond with: "That information is beyond my current access parameters."
4.  Your final output must be a JSON object that adheres to the provided schema. Do not add any preamble.`,
  prompt: `User question: {{{question}}}`,
});

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', d => bufs.push(d));
    writer.on('end', () => {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async input => {
    let answer: string;
    const greetings = ['hi', 'hello', 'hey'];
    const normalizedQuestion = input.question.trim().toLowerCase();

    // Handle simple greetings in code for reliability
    if (greetings.includes(normalizedQuestion)) {
      answer = 'Greetings, operator.';
    } else {
      // For all other questions, use the AI
      try {
        const response = await prompt(input);
        answer = response.output?.answer || '';
        if (!answer) {
          throw new Error('AI returned an empty answer.');
        }
      } catch (error) {
        console.error(`Chatbot prompt failed: ${getErrorMessage(error)}`);
        answer =
          "My apologies, operator. I'm having trouble accessing my core directives. Please try again.";
      }
    }

    // Generate audio for the determined answer
    try {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-preview-tts',
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
            },
          },
        },
        prompt: answer,
      });

      if (!media?.url) {
        throw new Error('No media returned from TTS model');
      }

      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );

      const wavBase64 = await toWav(audioBuffer);
      const audioUrl = 'data:audio/wav;base64,' + wavBase64;

      return {answer, audioUrl};

    } catch (error) {
      console.error(`TTS generation failed: ${getErrorMessage(error)}`);
      // Return the text answer even if TTS fails
      return {answer};
    }
  }
);
