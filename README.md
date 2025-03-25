# dJetLawyer ChatBot Frontend

This is the frontend application for the dJetLawyer AI ChatBot, built with Next.js and Chakra UI.

## Deployment

To deploy, push directly from github main branch to production-chatbotfrontend.

## Features

### Chat Sharing

The application now supports sharing chat conversations publicly:

- Both authenticated and anonymous users can share their chat conversations
- Sharing generates a unique link that can be copied and shared with anyone
- Anyone with the shared link can view the conversation without needing to log in
- Shared chats preserve all messages and source references

#### Interactive Shared Chats

- Users who visit a shared chat can continue the conversation by typing new messages
- For anonymous users, a new chat is created with the shared conversation as context
- For logged-in users, a copy of the shared chat is created in their account
- Usage limits apply for anonymous users (encouraging sign-up)
- This creates a seamless user experience and encourages new users to engage with the chatbot

How to use:
1. A share button is available in the chat interface
2. Clicking the share button generates a shareable link
3. The link can be copied and shared with anyone
4. Shared conversations can be viewed and continued at `/shared-chat?id={chat_id}`

## Development

### Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - Create a `.env` file with `NEXT_PUBLIC_API_URL` pointing to your backend
4. Start the development server: `npm run dev`

### Building for Production

To build the application for production, run:

```bash
npm run build
```

Then start the production server:

```bash
npm start
``` 