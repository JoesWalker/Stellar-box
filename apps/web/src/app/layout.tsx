import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StellarVerse — Build Your Universe on Stellar',
  description: 'Create, trade, and explore a decentralized metaverse powered by Stellar blockchain.',
  keywords: ['stellar', 'blockchain', 'metaverse', 'nft', 'web3'],
  openGraph: {
    title: 'StellarVerse',
    description: 'Build Your Universe on Stellar',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-space-900 text-white antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
