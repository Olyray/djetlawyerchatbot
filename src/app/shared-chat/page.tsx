import { Metadata, ResolvingMetadata } from 'next';
import { API_BASE_URL, APP_URL } from '../../utils/config';
import { SharedChatClient } from './SharedChatClient';

// Metadata generation function
export async function generateMetadata(
  { params, searchParams }: {
    params: {}; 
    searchParams: { id?: string }
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const chatId = searchParams.id || '';
  
  // You can fetch the actual chat title from your API if needed
  // Example:
  const chatData = await fetch(`${API_BASE_URL}/api/v1/chatbot/shared-chat/${chatId}`).then(res => res.json());
  const chatTitle = chatData.title;
  
  return {
    title: `${chatTitle} - dJetLawyer Chatbot`,
    description: 'View a shared conversation with dJet Lawyer, your AI legal assistant',
    openGraph: {
      title: `${chatTitle} - dJetLawyer Chatbot`,
      description: 'View a shared conversation with dJet Lawyer, your AI legal assistant',
      type: 'website',
      url: `${APP_URL}/shared-chat?id=${chatId}`,
      images: [
        {
          url: '/dJetLawyer_logo.png', // Make sure this exists in your public folder
          width: 1200,
          height: 630,
          alt: 'dJetLawyer Chatbot',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${chatTitle} - dJetLawyer Chatbot`,
      description: 'View a shared conversation with dJetLawyer, your AI legal assistant',
      images: ['/dJetLawyer_logo.png'], // Make sure this exists in your public folder
    },
  };
}

// Server component wrapper
export default function SharedChatPage() {
  return <SharedChatClient />;
}