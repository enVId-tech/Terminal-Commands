import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.scss';

export const metadata: Metadata = {
  title: {
    default: 'Terminal Commands',
    template: '%s · Terminal Commands',
  },
  description: 'Design interactive command-line workflows in the browser and run them with one command.',
};

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f7f9' },
    { media: '(prefers-color-scheme: dark)', color: '#0e1116' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
