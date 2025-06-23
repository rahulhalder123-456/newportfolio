'use server';

import { z } from 'zod';
import { Resend } from 'resend';

const sendEmailSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

type SendEmailInput = z.infer<typeof sendEmailSchema>;

const resend = new Resend(process.env.RESEND_API_KEY);
const toEmail = process.env.EMAIL_RECIPIENT;

export async function sendEmail(input: SendEmailInput) {
  const validatedFields = sendEmailSchema.safeParse(input);

  if (!validatedFields.success) {
    return {
      error: 'Invalid form data.',
    };
  }
  
  if (!toEmail) {
      console.error("EMAIL_RECIPIENT environment variable not set.");
      return { error: 'Server configuration error.' };
  }

  const { name, email, message } = validatedFields.data;

  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: toEmail,
      subject: `New message from ${name} via portfolio`,
      reply_to: email,
      html: `<p>You have received a new message from your portfolio contact form.</p>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong></p>
             <p>${message}</p>`,
    });

    if (data.error) {
        console.error("Resend error:", data.error);
        return { error: 'Failed to send message.' };
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return {
      error: 'An unexpected error occurred.',
    };
  }
}
