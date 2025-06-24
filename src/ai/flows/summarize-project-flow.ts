'use server';
/**
 * @fileOverview An AI flow to generate a project image from a title and summary.
 *
 * - generateProjectImage - A function that generates a project image.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import {
    ProjectImageInputSchema,
    type ProjectImageInput,
    ProjectImageOutputSchema,
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
      prompt: `Generate a visually stunning and abstract image that represents a software project.
The image should be suitable for a dark-themed developer portfolio, with a cyberpunk or futuristic aesthetic.
Use a dark color palette with vibrant accents of purple, teal, and magenta.
The image should be compelling, abstract, and not a literal representation.
Project Title: "${input.title}"
Project Summary: "${input.summary}"`,
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
