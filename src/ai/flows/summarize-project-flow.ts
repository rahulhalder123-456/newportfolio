'use server';
/**
 * @fileOverview An AI flow to generate a project image from a title and summary.
 *
 * - generateProjectImage - A function that generates a project image.
 */

import {ai} from '@/ai/genkit';
import { 
    ProjectImageInputSchema, 
    ProjectImageOutputSchema, 
    type ProjectImageInput, 
    type ProjectImageOutput 
} from './summarize-project.schema';

// Exported wrapper function to be called from the UI
export async function generateProjectImage(input: ProjectImageInput): Promise<ProjectImageOutput> {
  return await generateProjectImageFlow(input);
}

const generateProjectImageFlow = ai.defineFlow(
  {
    name: 'generateProjectImageFlow',
    inputSchema: ProjectImageInputSchema,
    outputSchema: ProjectImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `An abstract, high-tech image for a software project.
Title: "${input.title}"
Summary: "${input.summary}"
Style: Futuristic, digital art, glowing lines, dark background with electric purple and teal accents.
Aspect ratio: 3:2 landscape. No text.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
        throw new Error('Image generation failed to produce an image.');
    }

    return { imageUrl: media.url };
  }
);
