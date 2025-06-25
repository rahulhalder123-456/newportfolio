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
      prompt: `Generate a visually stunning, abstract image for a software project.

Theme: High-tech, futuristic, digital.
Style: Sleek, modern, with glowing abstract shapes and data patterns.
Color Palette: Dark background (dark gray, deep blue) with vibrant accents of electric purple and teal.
Aspect Ratio: 3:2 landscape (600x400).
Do not include any text or logos.

Project Title: "${input.title}"
Project Summary: "${input.summary}"

The image should be a unique visual metaphor for the project, inspired by the title and summary.`,
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
