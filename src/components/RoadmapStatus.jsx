import React from 'react';
import { CheckCircle2, Clock, GitBranch, Layers, Shield } from 'lucide-react';

export default function RoadmapStatus() {
  const implemented = [
    {
      title: 'Interactive HTTP 402 Request Simulator',
      desc: 'Simulates the complete client challenge/response cycle: payment request, mempool detection, and streaming access unlock.'
    },
    {
      title: 'Spec-Compliant ZIP-321 Payment URI Builder',
      desc: 'Encodes the memo parameter into standard Base64url without padding (RFC 4648 §5), fully compliant with the ZIP-321 spec.'
    },
    {
      title: '512-Byte Shielded Memo Schema & Parser',
      desc: 'Defines the application payload schema (prefix, session token, nonce, scope) and round-trip decoding helper.'
    },
    {
      title: 'Reference Middleware Implementations',
      desc: 'Architectural patterns for Express/Node.js, Next.js App Router, and Python FastAPI utilizing Incoming Viewing Keys.'
    },
    {
      title: 'Automated E2E Verification Suite',
      desc: 'Unit and integration test suite verifying ZIP-321 encoding, UI state transitions, and component rendering.'
    }
  ];

  const planned = [
    {
      title: 'Live zebrad / zaino gRPC Node Daemon',
      desc: 'Production background service connecting to Zebra or Zaino to scan unconfirmed mempool and mined blocks using IVKs.'
    },
    {
      title: 'Distributed Session Store (Redis / PostgreSQL)',
      desc: 'Persistent nonce tracking and stateful session storage to prevent memo replay across multi-instance API deployments.'
    },
    {
      title: 'Non-Custodial Multi-Tenant Merchant Portal',
      desc: 'Self-serve dashboard for API providers to register their Unified Address and deploy their Incoming Viewing Key.'
    },
    {
      title: 'Overpayment & Expired Note Reconciliation',
      desc: 'Automated refund and accounting protocol for transactions sent with incorrect amounts or after session expiration.'
    },
    {
      title: 'Published Packages on npm & PyPI',
      desc: 'Production-ready libraries for @cloakpay/sdk and python-cloakpay with built-in retry and fallback logic.'
    }
  ];

  return (
    <section id="roadmap" className="py-20 relative bg-cloak-900/30 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-3">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Engineering Transparency</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-[-0.025em] font-display">
            What works today vs. planned roadmap
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed font-sans max-w-2xl mx-auto">
            An honest breakdown for hackathon judges of what is implemented in this repository right now versus our planned production architecture.
          </p>
        </div>

        {/* 2-Column Grid: Implemented vs Planned */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Column 1: Implemented Today */}
          <div className="p-6 sm:p-7 rounded-2xl bg-cloak-900/90 border border-emerald-500/30">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-white/10">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white font-display">
                  Implemented in this Repo
                </h3>
                <span className="text-[11px] text-emerald-400 font-mono">
                  Verified & Testable Today
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {implemented.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-200 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-3.5 font-sans">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Planned Roadmap */}
          <div className="p-6 sm:p-7 rounded-2xl bg-cloak-900/90 border border-white/10">
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-white/10">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white font-display">
                  Planned Roadmap
                </h3>
                <span className="text-[11px] text-amber-300 font-mono">
                  Production Infrastructure
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {planned.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-300 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-3.5 font-sans">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

