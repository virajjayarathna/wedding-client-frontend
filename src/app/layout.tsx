import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

/**
 * Public origin this app is served from. Required for `metadataBase` — without
 * it Next.js resolves relative og:image paths against http://localhost:3000,
 * which link-preview crawlers obviously cannot fetch, so the image silently
 * disappears from the WhatsApp / Facebook card in production.
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://invite.colventra.xyz';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Wedding Invitation',
  description: 'You are invited!',
  openGraph: {
    title: 'Wedding Invitation',
    description: 'You are invited to celebrate our special day.',
    type: 'website',
    images: [{ url: '/og-fallback.jpg', width: 1200, height: 630, alt: 'Wedding Invitation' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Montserrat:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Great+Vibes&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333230',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
