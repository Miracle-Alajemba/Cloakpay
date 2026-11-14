import React, { useState, useEffect } from 'react';
import { Shield, ExternalLink, Menu, X } from 'lucide-react';

export default function Navbar({ onOpenDemo, onScrollToWorkbench }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-3 shadow-sm'
          : 'bg-[#fafaf9]/80 backdrop-blur-sm py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <a
            href="#"
            className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg py-1 px-1 -ml-1 group"
          >
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-emerald-50 border border-emerald-200/80 group-hover:border-emerald-300 transition-colors">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-base font-semibold tracking-tight text-slate-900 font-display">
              Cloak<span className="text-emerald-600">Pay</span>
            </span>
          </a>

          {/* Product-Focused Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#workbench"
              onClick={(e) => {
                if (onScrollToWorkbench) {
                  e.preventDefault();
                  onScrollToWorkbench();
                }
              }}
              className="hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded px-1"
            >
              How it works
            </a>
            <a
              href="#protocol"
              className="hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded px-1"
            >
              Architecture
            </a>
            <a
              href="#comparison"
              className="hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded px-1"
            >
              Privacy
            </a>
            <a
              href="#developers"
              className="hover:text-slate-900 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded px-1"
            >
              Developers
            </a>
          </nav>

          {/* Right Actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            <a
              href="https://zips.z.cash/zip-0321"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-md text-xs font-mono font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            >
              <span>ZIP-321 Spec</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <button
              onClick={onOpenDemo}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            >
              <span>Open paywall</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-xl border-b border-slate-200 px-4 pt-3 pb-5 space-y-2 mt-2 shadow-lg">
          <a
            href="#workbench"
            onClick={(e) => {
              setMobileMenuOpen(false);
              if (onScrollToWorkbench) {
                e.preventDefault();
                onScrollToWorkbench();
              }
            }}
            className="block px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-medium"
          >
            How it works
          </a>
          <a
            href="#protocol"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-medium"
          >
            Architecture
          </a>
          <a
            href="#comparison"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-medium"
          >
            Privacy
          </a>
          <a
            href="#developers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-700 font-medium"
          >
            Developers
          </a>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDemo();
              }}
              className="w-full py-2 rounded-md text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Open paywall</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
