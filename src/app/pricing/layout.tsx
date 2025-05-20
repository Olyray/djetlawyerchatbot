import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | dJetLawyer Chatbot',
  description: 'Choose the right plan for your legal assistance needs. Compare free and premium features for dJetLawyer chatbot.',
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 