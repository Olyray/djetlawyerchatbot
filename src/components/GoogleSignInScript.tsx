'use client';

import Script from 'next/script';

export function GoogleSignInScript() {
  return (
    <Script src="https://accounts.google.com/gsi/client" async defer />
  );
} 