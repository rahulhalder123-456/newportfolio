
'use server';
/**
 * @fileOverview A Text-to-Speech (TTS) AI flow that generates MP3 audio.
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
import lamejs from 'lamejs';

export async function textToSpeech(
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

/**
 * Converts raw PCM audio data from Gemini into an MP3 file.
 * @param pcmData - The raw audio data buffer.
 * @param channels - Number of audio channels.
 * @param sampleRate - The sample rate of the audio.
 * @param bitRate - The bitrate for the MP3 encoding.
 * @returns A Base64-encoded string of the MP3 data.
 */
function toMp3(
  pcmData: Buffer,
  channels = 1,
  sampleRate = 24000,
  bitRate = 128
): string {
  // Gemini returns 16-bit PCM audio, so we need an Int16Array view on the Buffer.
  const samples = new Int16Array(
    pcmData.buffer,
    pcmData.byteOffset,
    pcmData.length / Int16Array.BYTES_PER_ELEMENT
  );

  const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitRate);
  const mp3Data: Buffer[] = [];
  
  // Lamejs processes audio in chunks.
  const sampleBlockSize = 1152;

  for (let i = 0; i < samples.length; i += sampleBlockSize) {
    const sampleChunk = samples.subarray(i, i + sampleBlockSize);
    const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
    if (mp3buf.length > 0) {
      mp3Data.push(Buffer.from(mp3buf));
    }
  }

  // Finalize the MP3 stream.
  const mp3buf = mp3encoder.flush();
  if (mp3buf.length > 0) {
    mp3Data.push(Buffer.from(mp3buf));
  }

  return Buffer.concat(mp3Data).toString('base64');
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
        prebuiltVoiceConfig: { voiceName: 'Palawan' },
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

    const mp3Base64 = toMp3(audioBuffer);

    return {
      audioUrl: 'data:audio/mp3;base64,' + mp3Base64,
    };
  }
);
