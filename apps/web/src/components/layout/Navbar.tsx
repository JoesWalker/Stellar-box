'use client';

import Link from 'next/link';
import { ConnectWalletButton } from './ConnectWalletButton';

const NAV_LINKS = [
  { href: '/world', label: 'World' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/create', label: 'Create' },
  { href: '/build', label: 'Build' },
];

export function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-stellar-purple-800/30 bg-space-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-gradient">✦ StellarVerse</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        <ConnectWalletButton />
      </div>
    </nav>
  );
}
