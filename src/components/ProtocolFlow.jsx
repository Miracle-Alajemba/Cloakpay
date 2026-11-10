import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  FileTerminal, 
  Radio, 
  Cpu, 
  Lock, 
  Key, 
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function ProtocolFlow() {
  const steps = [
    {
      step: '01',
      title: 'HTTP 402 Challenge Issued',
      badge: 'Client & Reverse Proxy',
      description: 'The user or AI agent queries a restricted endpoint. The CloakPay middleware halts unauthenticated access and responds with HTTP 402 Payment Required.',
      details: [
        'Generates ephemeral session token (e.g. sess_9e14a8)',
        'Returns ZIP-321 formatted URI in WWW-Authenticate header',
        'Includes shielded Unified Address (UA) and exact amount in ZEC',
      ],
      icon: FileTerminal,
      color: 'from-amber-500/20 to-amber-950/30',
      border: 'border-amber-500/30',
      iconColor: 'text-amber-400',
    },
    {
      step: '02',
      title: 'Encrypted Memo Broadcast',
      badge: 'Orchard Shielded Pool',
      description: 'The user scans the QR code with their mobile Zcash wallet (Zashi, YWallet). A shielded transaction is broadcast to the peer-to-peer network.',
      details: [
        '512-byte encrypted memo holds "CloakPay:sess_9e14a8"',
        'Zero public sender address on ledger (Orchard circuit)',
        'Amount and recipient are concealed by Halo 2 zero-knowledge proofs',
      ],
      icon: Radio,
      color: 'from-emerald-500/20 to-emerald-950/30',
      border: 'border-emerald-500/30',
      iconColor: 'text-emerald-400',
    },
    {
      step: '03',
      title: 'Sub-Second Mempool Match',
      badge: 'CloakPay Node Daemon',
      description: 'CloakPay node scans the unconfirmed mempool using the merchant Incoming Viewing Key (IVK). When the matching session token decrypts, access unlocks instantly.',
      details: [
        'No waiting for block confirmation (0-conf mempool verified)',
        'Ephemeral auth token issued to client stream',
        'No cookies, no email signups, no identity records retained',
      ],
      icon: Cpu,
      color: 'from-teal-500/20 to-teal-950/30',
      border: 'border-teal-500/30',
      iconColor: 'text-teal-400',
    },
  ];

  return (
    <section id="protocol" className="py-24 relative bg-cloak-900/40 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium mb-3">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>ARCHITECTURE SPECIFICATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            How CloakPay Works
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base">
            The native web was designed with <code className="text-emerald-400 font-mono">402 Payment Required</code> in 1996.
            CloakPay fulfills that vision with modern Zcash zero-knowledge cryptography.
          </p>
        </div>

        {/* 3 Step Protocol Flow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="relative p-6 sm:p-8 rounded-3xl bg-cloak-900/90 border border-white/10 hover:border-emerald-500/40 transition-all duration-300 group shadow-xl flex flex-col justify-between"
              >
                {/* Step indicator top */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-extrabold font-mono text-slate-600 group-hover:text-emerald-400 transition-colors">
                      {s.step}
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10">
                      {s.badge}
                    </span>
                  </div>

                  {/* Icon badge */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} border ${s.border} flex items-center justify-center mb-5 shadow-lg group-hover:scale-105 transition-transform`}>
                    <Icon className={`w-6 h-6 ${s.iconColor}`} />
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 font-sans">
                    {s.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                    {s.description}
                  </p>
                </div>

                {/* Details list */}
                <div className="pt-4 border-t border-white/5 space-y-2">
                  {s.details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}

        </div>

        {/* Deep Dive Banner: Why Encrypted Memos solve Web3 privacy */}
        <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cloak-850 via-cloak-900 to-emerald-950/30 border border-emerald-500/20 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE 512-BYTE SHIELDED ADVANTAGE</span>
            </div>
            <h4 className="text-xl font-bold text-white">
              Why not Bitcoin Lightning or Ethereum?
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Public blockchains link every micro-transaction to your persistent wallet address, IP address, and node gossip telemetry. 
              Zcash Orchard notes use Halo 2 zero-knowledge recursion with an encrypted 512-byte payload. 
              Only the receiver's Incoming Viewing Key can decrypt the session token—onlookers see pure cryptographic noise.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href="https://zcash.readthedocs.io/en/latest/rtd_pages/orchard.html"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-200 transition-colors flex items-center gap-2"
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              View Orchard Cryptography
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

