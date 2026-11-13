import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';

export default function Footer({ onOpenDemo }) {
  return (
    <footer className="bg-cloak-950 border-t border-white/10 py-12 text-slate-400 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Product Row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
          
          {/* Identity & Plain-Language Summary */}
          <div className="space-y-2 max-w-lg text-left">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-base font-semibold tracking-tight text-white font-display">
                Cloak<span className="text-emerald-400">Pay</span>
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pay-per-request API micropayments powered by shielded Zcash via HTTP 402.
            </p>
          </div>

          {/* Useful Product & Developer Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-300" aria-label="Footer Navigation">
            <a
              href="#demo"
              className="hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded px-1"
            >
              How it works
            </a>
            <a
              href="#protocol"
              className="hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded px-1"
            >
              Architecture
            </a>
            <a
              href="#comparison"
              className="hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded px-1"
            >
              Privacy
            </a>
            <a
              href="#developers"
              className="hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded px-1"
            >
              Developers
            </a>
            <a
              href="https://zips.z.cash/zip-0321"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded px-1"
            >
              <span>ZIP-321 Spec</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
            <a
              href="https://github.com/Miracle-Alajemba/Cloakpay"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded px-1"
            >
              <span>Source</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </a>
          </nav>

        </div>

        {/* Bottom Metadata */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
          <p>
            RFC 9110 and ZIP-321 specification compliant micropayments
          </p>
          <div className="font-mono text-[11px] text-slate-400">
            © 2026 CloakPay. MIT License.
          </div>
        </div>

      </div>
    </footer>
  );
}
