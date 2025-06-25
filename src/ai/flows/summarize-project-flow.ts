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
      prompt: `You are a visionary digital artist specializing in creating concept art for high-tech software and futuristic interfaces. Your task is to generate a visually stunning and sophisticated image that represents a software project based on its title and summary.

**Instructions:**
1.  **Theme:** The image must evoke a sense of advanced technology, data intelligence, and digital craftsmanship. Think cyberpunk, futuristic, and sleek aesthetics.
2.  **Visual Elements:** Incorporate abstract representations of code, data streams, glowing circuit patterns, or neural network structures. The image should feel like a glimpse into a complex digital world. It should be abstract but clearly related to technology.
3.  **Color Palette:** Adhere to a dark, modern theme. The background should be dark (deep blues, blacks, or dark grays). Use vibrant, luminous accents of electric purple, cyan, and magenta to create contrast and energy.
4.  **Composition:** Create a dynamic and balanced composition with a clear focal point. Employ depth of field to create a sense of scale and immersion. The image should be cinematic and polished, suitable for a professional portfolio.
5.  **Resolution:** The final image MUST have an exact resolution of 600x400 pixels (a 3:2 landscape aspect ratio).
6.  **Project Context:** Use the project's title and summary to inspire the specific shapes, colors, and flow of the visual elements. The image should feel like a unique visual metaphor for the project itself, not a generic tech background.

**Project Details:**
- **Title:** "${input.title}"
- **Summary:** "${input.summary}"

Generate a compelling, high-fidelity image that captures the essence of this project.`,
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
