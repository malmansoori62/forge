import type { Metadata, Viewport } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import DbBoot from '@/components/DbBoot';
import SWRegister from '@/components/SWRegister';
import InstallPrompt from '@/components/InstallPrompt';

export const metadata: Metadata = {
  title: 'FORGE — Train. Track. Forge.',
  description: 'Local-first PPL workout tracker with auto-progression, swap suggestions and progress photos.',
  applicationName: 'FORGE',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FORGE',
    startupImage: ['/apple-touch-icon.png']
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: '#0d0f0c',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-forge-ink text-forge-bone antialiased">
        <DbBoot />
        <SWRegister />
        <main className="mx-auto max-w-md min-h-screen pb-28 safe-top">{children}</main>
        <InstallPrompt />
        <BottomNav />
      </body>
    </html>
  );
}
