import React, { useState, useEffect } from 'react';
import { Shield, Zap, Lock, Terminal, ExternalLink, Menu, X } from 'lucide-react';

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
          ? 'bg-cloak-950/80 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/50 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <a href="#" className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-xl py-1 px-1 -ml-1">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-950/40 border border-emerald-500/30 group-hover:border-emerald-400/60 transition-all shadow-md shadow-emerald-500/10">
              <Shield className="w-4.5 h-4.5 text-emerald-400 transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 rounded-xl bg-emerald-400/20 blur-sm -z-10 group-hover:opacity-100 opacity-40 transition-opacity" />
            </div>
            <span className="text-xl font-semibold tracking-[-0.02em] text-white font-display">
              Cloak<span className="text-emerald-400">Pay</span>
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a
              href="#demo"
              className="hover:text-emerald-400 transition-colors text-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none rounded px-1"
            >
              Demo
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
              Privacy Comparison
            </a>
            <a
              href="#developers"
              className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none rounded px-1"
            >
              Developers
            </a>
            <a
              href="#roadmap"
              className="hover:text-emerald-400 transition-colors text-slate-300 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none rounded px-1"
            >
              Roadmap
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="https://zips.z.cash/zip-0321"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-lg text-xs font-mono font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5"
            >
              ZIP-321 Spec
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <button
              onClick={onOpenDemo}
              className="relative px-4 py-2 rounded-lg text-xs font-semibold text-cloak-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2 group cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-cloak-950 transition-transform group-hover:rotate-12" />
              Launch Paywall Demo
            </button>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cloak-900/95 backdrop-blur-2xl border-b border-white/10 px-4 pt-3 pb-6 space-y-3 mt-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <a
            href="#protocol"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-white/5 hover:text-emerald-400"
          >
            Protocol Architecture
          </a>
          <a
            href="#demo"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-white/5 hover:text-emerald-400"
          >
            Interactive Demo
          </a>
          <a
            href="#comparison"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-white/5 hover:text-emerald-400"
          >
            Privacy Comparison
          </a>
          <a
            href="#developers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-white/5 hover:text-emerald-400"
          >
            Developer Middleware
          </a>
          <a
            href="#roadmap"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-white/5 hover:text-emerald-400"
          >
            Roadmap & Status
          </a>
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemo();
              }}
              className="w-full py-2.5 rounded-lg text-xs font-semibold text-cloak-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              Launch Paywall Demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
