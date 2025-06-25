# Firebase Studio Portfolio

This is a Next.js starter portfolio built in Firebase Studio. It features a modern design, an admin dashboard for managing projects, and AI-powered features like image generation and a chatbot.

## Features

- **Next.js App Router**: Modern, fast, and server-centric.
- **ShadCN UI & Tailwind CSS**: For a beautiful and customizable design system.
- **Genkit for AI**: Powers project image generation and the chatbot.
- **Firebase Firestore**: As a database for storing project information.
- **Admin Dashboard**: A password-protected area to add, edit, and delete projects.
- **Contact Form**: Integrated with Resend for email delivery.

## Getting Started

### 1. Set Up Environment Variables

This project uses environment variables to securely store API keys and other sensitive information.

1.  **Create the file**: Make a copy of the `.env` file and name it `.env.local`:
    ```bash
    cp .env .env.local
    ```
2.  **Fill in the values**: Open `.env.local` and replace the placeholder values with your actual credentials.
    -   `GOOGLE_API_KEY`: Get this from the Google AI Studio.
    -   `RESEND_API_KEY`: Get this from your Resend dashboard. You will also need to verify your domain.
    -   `EMAIL_RECIPIENT`: The email address where you want to receive contact form messages.
    -   `NEXT_PUBLIC_ADMIN_PASSWORD`: A secure password of your choice to protect the `/admin` route.
    -   `FIREBASE_*`: Get these values from your Firebase project's service account settings. When you generate a new private key JSON file, you'll find the `project_id`, `client_email`, and `private_key` inside.
        - **Important**: When you copy the `private_key` into your `.env.local` file, you must replace all newline characters (`
`) with the literal characters `\n`.

### 2. Install Dependencies

Install the project dependencies using your preferred package manager:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Run the Development Server

Start the development server:

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result. You can start editing the page by modifying `src/app/page.tsx`.
