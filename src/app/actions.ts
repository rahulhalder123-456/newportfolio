'use server';

import { z } from 'zod';
import { Resend } from 'resend';

const sendEmailSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

type SendEmailInput = z.infer<typeof sendEmailSchema>;

const resendApiKey = process.env.RESEND_API_KEY;
const toEmail = process.env.EMAIL_RECIPIENT;

export async function sendEmail(input: SendEmailInput) {
  const validatedFields = sendEmailSchema.safeParse(input);

  if (!validatedFields.success) {
    return {
      error: 'Invalid form data. Please check your inputs.',
    };
  }
  
  if (!toEmail) {
      console.error("EMAIL_RECIPIENT environment variable not set.");
      return { error: 'Server configuration error: Missing recipient email. Please contact the site administrator.' };
  }

  if (!resendApiKey || resendApiKey === 'REPLACE_WITH_YOUR_RESEND_API_KEY') {
    console.error('RESEND_API_KEY environment variable is not set or is a placeholder.');
    return { error: 'Server configuration error: Email service is not configured. Please contact the site administrator.' };
  }

  const resend = new Resend(resendApiKey);
  const { name, email, message } = validatedFields.data;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Code Cipher <onboarding@resend.dev>',
      to: toEmail,
      subject: `New message from ${name} via portfolio`,
      reply_to: email,
      html: `<p>You have received a new message from your portfolio contact form.</p>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong></p>
             <p>${message}</p>`,
    });

    // This block handles errors returned by the Resend API
    if (error) {
        console.error("Resend API returned an error:", error);
        return { error: `API Error: ${error.message}` };
    }

    return { success: true };
  } catch (exception) {
    // This block handles exceptions thrown by the SDK (e.g., network issues)
    console.error("Caught exception in sendEmail:", exception);
    const errorMessage = exception instanceof Error ? exception.message : 'An unknown exception occurred.';
    return {
      error: `An unexpected error occurred: ${errorMessage}`,
    };
  }
}
