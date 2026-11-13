import React, { useState, useEffect } from 'react';
import { Shield, ExternalLink, Menu, X } from 'lucide-react';

export default function Navbar({ onOpenDemo }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-cloak-950/90 backdrop-blur-md border-b border-white/10 py-3.5 shadow-xl shadow-black/40'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <a
            href="#"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg py-1 px-1 -ml-1 group"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/20 group-hover:border-emerald-400/50 transition-colors">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white font-display">
              Cloak<span className="text-emerald-400">Pay</span>
            </span>
          </a>

          {/* Product-Focused Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a
              href="#demo"
              className="hover:text-emerald-400 transition-colors text-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none rounded px-1"
            >
              How it works
            </a>
            <a
              href="#protocol"
              className="hover:text-emerald-400 transition-colors text-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none rounded px-1"
            >
              Architecture
            </a>
            <a
              href="#comparison"
              className="hover:text-emerald-400 transition-colors text-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none rounded px-1"
            >
              Privacy
            </a>
            <a
              href="#developers"
              className="hover:text-emerald-400 transition-colors text-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none rounded px-1"
            >
              Developers
            </a>
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="https://zips.z.cash/zip-0321"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-md text-xs font-mono font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            >
              ZIP-321 Spec
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <button
              onClick={onOpenDemo}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-cloak-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            >
              <span>Preview paywall</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-cloak-950/15 text-cloak-900 font-semibold">
                Preview
              </span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cloak-950/98 backdrop-blur-xl border-b border-white/10 px-4 pt-3 pb-6 space-y-2 mt-3">
          <a
            href="#demo"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-white/5 hover:text-emerald-400"
          >
            How it works
          </a>
          <a
            href="#protocol"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-white/5 hover:text-emerald-400"
          >
            Architecture
          </a>
          <a
            href="#comparison"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-white/5 hover:text-emerald-400"
          >
            Privacy
          </a>
          <a
            href="#developers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-white/5 hover:text-emerald-400"
          >
            Developers
          </a>
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemo();
              }}
              className="w-full py-2 rounded-md text-xs font-medium text-cloak-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Preview paywall</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-cloak-950/15 text-cloak-900 font-semibold">
                Preview
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
