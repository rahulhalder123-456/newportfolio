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
      // This prompt has been simplified to be faster and avoid timeouts on Vercel.
      prompt: `A futuristic, abstract, high-tech digital art image for a software project titled "${input.title}". Dark background with glowing electric purple and teal lines. Aspect ratio 3:2 landscape. No text.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media?.url) {
        throw new Error('Image generation failed to produce an image. The AI model may be temporarily unavailable or the API key may be invalid.');
    }

    return { imageUrl: media.url };
  }
);
