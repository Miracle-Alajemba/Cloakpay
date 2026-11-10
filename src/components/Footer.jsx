import React from 'react';
import { Shield, Heart, ExternalLink, Terminal, Lock } from 'lucide-react';

export default function Footer({ onOpenDemo }) {
  return (
    <footer className="relative bg-cloak-950 border-t border-white/10 pt-16 pb-12 overflow-hidden">
      {/* Subtle bottom ambient light */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">

          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-950/40 border border-emerald-500/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Cloak<span className="text-emerald-400">Pay</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                HTTP 402
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              The privacy-first micro-payment gateway powered by Zcash Encrypted Memos.
              Eliminating surveillance capitalism for artificial intelligence, paywalled media, and sovereign APIs.
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Zcash Orchard Network: Synced & Online</span>
            </div>
          </div>

          {/* Column 2: Protocol */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
              Protocol
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#protocol" className="hover:text-emerald-400 transition-colors">
                  RFC 9110 Specification
                </a>
              </li>
              <li>
                <a
                  href="https://zips.z.cash/zip-0321"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  ZIP-321 Standard <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://zcash.readthedocs.io/en/latest/rtd_pages/orchard.html"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  Orchard Cryptography <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="#comparison" className="hover:text-emerald-400 transition-colors">
                  Zero-Metadata Matrix
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Developers */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
              Developers
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#developers" className="hover:text-emerald-400 transition-colors">
                  Express Middleware
                </a>
              </li>
              <li>
                <a href="#developers" className="hover:text-emerald-400 transition-colors">
                  Next.js App Router
                </a>
              </li>
              <li>
                <a href="#developers" className="hover:text-emerald-400 transition-colors">
                  FastAPI Python
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenDemo}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Interactive Simulator
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Ecosystem & Wallets */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
              Zcash Wallets
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://zashi.z.cash"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center justify-between"
                >
                  <span>Zashi (Electric Coin Co.)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://ywallet.app"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center justify-between"
                >
                  <span>YWallet</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://zingo.app"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center justify-between"
                >
                  <span>Zingo! Mobile</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <span>Built for the Cypherpunk Future • Powered by</span>
            <span className="text-emerald-400 font-bold">Zcash (ZEC)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>No Cookies</span>
            <span>•</span>
            <span>No Trackers</span>
            <span>•</span>
            <span>Open Source Protocol</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
