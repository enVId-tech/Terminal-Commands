// app/layout.tsx
import { Inter } from 'next/font/google';
import {NextFont} from "next/dist/compiled/@next/font";

const inter: NextFont = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CLI Command Builder',
  description: 'Build interactive command-line tools with JSON configuration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main>{children}</main>
      </body>
    </html>
  );
}