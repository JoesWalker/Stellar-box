'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';

// ── Animated star canvas ──────────────────────────────────────────────────────
function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.3 + 0.05,
      opacity: Math.random(),
      delta: (Math.random() - 0.5) * 0.01,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.opacity = Math.max(0.1, Math.min(1, s.opacity + s.delta));
        if (s.opacity <= 0.1 || s.opacity >= 1) s.delta *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

// ── Feature cards ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '🎨',
    title: 'Asset Creator',
    desc: 'Design voxel assets and mint them as NFTs on Stellar with near-zero fees.',
    href: '/create',
  },
  {
    icon: '🏗️',
    title: 'Game Builder',
    desc: 'Place assets on your land parcels and build interactive experiences.',
    href: '/build',
  },
  {
    icon: '🛒',
    title: 'Marketplace',
    desc: 'Trade land and assets trustlessly via Soroban smart contracts.',
    href: '/marketplace',
  },
  {
    icon: '🗺️',
    title: 'World Map',
    desc: 'Explore the 16×16 grid universe and discover what others have built.',
    href: '/world',
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-space-gradient">
        <StarField />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-stellar-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-stellar-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-stellar-gold-400 text-sm font-semibold tracking-widest uppercase mb-4">
            The Open Metaverse on Stellar
          </p>
          <h1 className="text-5xl sm:text-7xl font-extrabold leading-tight mb-6">
            <span className="text-gradient">Build Your</span>
            <br />
            <span className="text-white">Universe</span>
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            Own land, create voxel assets, and trade in a trustless marketplace — all powered by
            Soroban smart contracts with 5-second finality.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/world" className="btn-primary text-base">
              Explore World
            </Link>
            <Link href="/marketplace" className="btn-secondary text-base">
              View Marketplace
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-slate-500 text-sm">
          ↓ scroll
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-24 px-4 bg-space-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Everything you need to{' '}
            <span className="text-gradient">create & earn</span>
          </h2>
          <p className="text-slate-400 text-center mb-14 max-w-xl mx-auto">
            StellarVerse gives creators and players the tools to build a living, breathing universe.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon, title, desc, href }) => (
              <Link
                key={title}
                href={href}
                className="card-space group hover:border-stellar-purple-500/60 transition-colors duration-200"
              >
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-stellar-purple-300 transition-colors">
                  {title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-20 px-4 bg-space-800 border-t border-stellar-purple-800/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">
            Ready to claim your land?
          </h2>
          <p className="text-slate-400 mb-8">
            Connect your Stellar wallet and mint your first land parcel today.
          </p>
          <Link href="/world" className="btn-primary text-base">
            Get Started →
          </Link>
        </div>
      </section>
    </>
  );
}
