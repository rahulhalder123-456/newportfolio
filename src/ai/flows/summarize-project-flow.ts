'use server';
/**
 * @fileOverview An AI flow to generate a project image from a title and summary.
 *
 * - generateProjectImage - A function that generates a project image.
 * - ProjectImageInput - The input type for the generateProjectImage function.
 * - ProjectImageOutput - The return type for the generateProjectImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Schemas are defined in this file for better clarity.
export const ProjectImageInputSchema = z.object({
  title: z.string().min(2).describe('The title of the project.'),
  summary: z.string().min(10).describe('A summary of the project.'),
});
export type ProjectImageInput = z.infer<typeof ProjectImageInputSchema>;

export const ProjectImageOutputSchema = z.object({
  imageUrl: z.string().url().describe('A data URI for the generated project image.'),
});
export type ProjectImageOutput = z.infer<typeof ProjectImageOutputSchema>;

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
The image must have an exact resolution of 600x400 pixels (a 3:2 landscape aspect ratio).
The image should be suitable for a dark-themed developer portfolio, with a cyberpunk or futuristic aesthetic.
Use a dark color palette with vibrant accents of purple, teal, and magenta.
The image should be compelling and abstract, not a literal representation.
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
