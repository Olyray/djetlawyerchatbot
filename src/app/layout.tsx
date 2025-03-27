// Root layout component that provides the foundational structure for the entire application
import { Metadata } from 'next';
import { GoogleSignInScript } from '../components/GoogleSignInScript';
import { AppProviders } from '../components/AppProviders';
import { APP_URL } from '@/utils/config';

// Define default metadata for the entire application
export const metadata: Metadata = {
  title: {
    template: '%s | dJetLawyer Chatbot',
    default: 'dJetLawyer Chatbot - Your AI Legal Assistant',
  },
  description: 'Get instant legal assistance and answers to your legal questions with dJetLawyer AI Chatbot',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: APP_URL,
    title: 'dJetLawyer Chatbot - Your AI Legal Assistant',
    description: 'Get instant legal assistance and answers to your legal questions with dJetLawyer AI Chatbot',
    siteName: 'dJetLawyer Chatbot',
    images: [
      {
        url: '/dJetLawyer_logo.png',
        width: 1200,
        height: 630,
        alt: 'dJetLawyer Chatbot',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'dJetLawyer Chatbot - Your AI Legal Assistant',
    description: 'Get instant legal assistance and answers to your legal questions with dJet Lawyer AI Chatbot',
    images: ['/dJetLawyer_logo.png'],
  },
};

// RootLayout component serves as the application shell, wrapping all pages with necessary providers
// It sets up the basic HTML structure and includes essential third-party scripts
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Google Sign-In script needs to be a client component */}
        <GoogleSignInScript />
        
        {/* App providers wrapped in a client component */}
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
