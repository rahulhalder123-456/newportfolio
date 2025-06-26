
'use server';

import { z } from 'zod';
import nodemailer from 'nodemailer';
import { getErrorMessage } from '@/lib/utils';

const sendEmailSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

type SendEmailInput = z.infer<typeof sendEmailSchema>;

const gmailEmail = process.env.GMAIL_EMAIL;
// Remove any spaces from the app password to prevent common copy-paste errors.
const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '');
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

  if (!gmailEmail || !gmailAppPassword) {
    console.error('Nodemailer environment variables are not set.');
    return { error: 'Server configuration error: The email service is not set up. Please ensure GMAIL_EMAIL and GMAIL_APP_PASSWORD are in your environment variables. Note: GMAIL_APP_PASSWORD is a special password you must generate from your Google Account settings. See the README.md for instructions.' };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailEmail,
      pass: gmailAppPassword,
    },
  });

  const { name, email, message } = validatedFields.data;

  try {
    const mailOptions = {
      from: `"Rahul Halder Portfolio" <${gmailEmail}>`,
      to: toEmail,
      subject: `New message from ${name} via portfolio`,
      replyTo: email,
      html: `<p>You have received a new message from your portfolio contact form.</p>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong></p>
             <p>${message}</p>`,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };

  } catch (exception) {
    console.error("Caught exception in sendEmail:", exception);
    return {
      error: `An unexpected error occurred: ${getErrorMessage(exception)}`,
    };
  }
}
