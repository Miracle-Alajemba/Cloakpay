import React from 'react';
import { 
  FileTerminal, 
  Radio, 
  Cpu, 
  Lock, 
  Key, 
  CheckCircle2,
  Shield,
  AlertCircle
} from 'lucide-react';

export default function ProtocolFlow() {
  const steps = [
    {
      step: '01',
      title: 'HTTP 402 Challenge Issued',
      badge: 'Client & API Gateway',
      description: 'A client calls an API endpoint without a valid token. The API gateway returns HTTP 402 Payment Required with a ZIP-321 payment request containing the price, recipient address, and an ephemeral session token.',
      details: [
        'Returns HTTP 402 with CloakPay’s payment challenge; RFC 9110 reserves the status code for future use.',
        'Includes ZIP-321 URI with Base64url-encoded memo parameter',
        'Session token is tied to the caller request session',
      ],
      icon: FileTerminal,
      color: 'from-amber-500/15 to-amber-950/25',
      border: 'border-amber-500/25',
      iconColor: 'text-amber-400',
    },
    {
      step: '02',
      title: 'Shielded Zcash Payment Broadcast',
      badge: 'Orchard Shielded Pool',
      description: 'The user or client wallet broadcasts a shielded Zcash transaction. The transaction embeds the session token into the 512-byte encrypted memo field.',
      details: [
        'Sender, recipient, and amount are shielded on-chain',
        'Memo encrypted with ChaCha20-Poly1305 to recipient note key',
        'Compatible with standard wallets (Zashi, YWallet, Zingo!)',
      ],
      icon: Radio,
      color: 'from-emerald-500/15 to-emerald-950/25',
      border: 'border-emerald-500/25',
      iconColor: 'text-emerald-400',
    },
    {
      step: '03',
      title: 'Incoming Viewing Key (IVK) Detection',
      badge: 'API Provider Node',
      description: 'The API provider scans incoming notes using an Incoming Viewing Key (IVK). When the matching session token decrypts, access is granted to the requesting client.',
      details: [
        'IVK has zero spending authority (least-privilege design)',
        'Supports mempool or block-level confirmation thresholds',
        'No user account or credit card required',
      ],
      icon: Cpu,
      color: 'from-teal-500/15 to-teal-950/25',
      border: 'border-teal-500/25',
      iconColor: 'text-teal-400',
    },
  ];

  return (
    <section id="protocol" className="py-20 relative bg-cloak-900/40 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-3">
            <Lock className="w-3.5 h-3.5" />
            <span>Technical Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-[-0.025em] font-display">
            How CloakPay works under the hood
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed font-sans max-w-2xl mx-auto">
            RFC 9110 reserves HTTP 402 (&lsquo;Payment Required&rsquo;) for future use; it does not define a payment protocol. CloakPay uses 402 as its application-level payment challenge and supplies payment instructions using a ZIP-321 URI.
          </p>
        </div>

        {/* 3 Step Protocol Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="relative p-6 sm:p-7 rounded-2xl bg-cloak-900/90 border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-semibold font-mono text-slate-500">
                      {s.step}
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                      {s.badge}
                    </span>
                  </div>

                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} border ${s.border} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${s.iconColor}`} />
                  </div>

                  <h3 className="text-base font-semibold text-white mb-2 font-display">
                    {s.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5 font-sans">
                    {s.description}
                  </p>
                </div>

                {/* Details list */}
                <div className="pt-4 border-t border-white/5 space-y-2">
                  {s.details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2 text-xs text-slate-300 font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}

        </div>

        {/* Viewing Key Security & Architecture Clarification */}
        <div className="mt-12 p-6 sm:p-7 rounded-2xl bg-cloak-850/80 border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <Shield className="w-3.5 h-3.5" />
              <span>LEAST-PRIVILEGE SECURITY DESIGN</span>
            </div>
            <h3 className="text-lg font-semibold text-white font-display">
              Why Incoming Viewing Keys (IVKs) protect API providers
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              API providers only deploy an <strong>Incoming Viewing Key (IVK)</strong> to their servers. 
              An IVK allows scanning for incoming transactions and decrypting the memo field to authenticate session tokens, 
              but has zero authority to spend funds or view outgoing transactions. Spending keys remain in cold storage.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="https://zips.z.cash/zip-0321"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-200 transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              <span>Read ZIP-321 Specification</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
