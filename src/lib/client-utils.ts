"use client";

/**
 * Compresses an image data URL to a JPEG format.
 * This function is client-side only as it uses browser APIs.
 * @param dataUrl The original data URL of the image (e.g., from AI generation).
 * @param quality The quality of the output JPEG (0 to 1).
 * @returns A promise that resolves to the compressed JPEG data URL.
 */
export async function compressImage(dataUrl: string, quality: number = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // The AI prompt requests 600x400, so we'll match that.
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Could not get canvas context'));
      }
      // Draw the image onto the canvas, resizing it.
      ctx.drawImage(img, 0, 0, 600, 400);

      // Convert to JPEG, which is much smaller than PNG.
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.onerror = (err) => {
      console.error("Image compression error:", err);
      reject(new Error('Failed to load image for compression.'));
    };
    img.src = dataUrl;
  });
}
