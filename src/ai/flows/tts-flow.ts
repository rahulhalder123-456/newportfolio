
'use server';
/**
 * @fileOverview A Text-to-Speech (TTS) AI flow that generates WAV audio.
 *
 * - textToSpeech - A function that converts text into audible speech.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  TextToSpeechInputSchema,
  type TextToSpeechInput,
  TextToSpeechOutputSchema,
  type TextToSpeechOutput,
} from './tts.schema';
import wav from 'wav';

export async function textToSpeech(
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

/**
 * Converts raw PCM audio data from Gemini into a WAV file format.
 * @param pcmData - The raw audio data buffer.
 * @param channels - Number of audio channels.
 * @param sampleRate - The sample rate of the audio.
 * @param sampleWidth - The bit depth of the audio samples.
 * @returns A Base64-encoded string of the WAV data.
 */
function toWav(
  pcmData: Buffer,
  channels = 1,
  sampleRate = 24000,
  sampleWidth = 2 // 16-bit
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const writer = new wav.Writer({
        channels,
        sampleRate,
        bitDepth: sampleWidth * 8,
      });

      const bufs: Buffer[] = [];
      writer.on('data', (chunk) => bufs.push(chunk));
      writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));
      writer.on('error', reject);
      
      writer.write(pcmData);
      writer.end();
    } catch(err) {
      reject(err);
    }
  });
}

const ttsPrompt = ai.definePrompt({
  name: 'ttsPrompt',
  model: 'googleai/gemini-2.5-flash-preview-tts',
  input: { schema: TextToSpeechInputSchema },
  prompt: '{{text}}',
  config: {
    responseModalities: ['AUDIO'],
    speechConfig: {
      voiceConfig: {
        prebuiltVoiceConfig: { voiceName: 'Algenib' },
      },
    },
  },
});

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async (input) => {
    const { media } = await ttsPrompt(input);

    if (!media?.url) {
      throw new Error('No media returned from TTS model');
    }

    // The data URI contains base64 encoded PCM audio.
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);

    return {
      audioUrl: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
