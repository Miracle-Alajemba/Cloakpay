import React from 'react';
import { 
  ShieldCheck, 
  XCircle, 
  AlertCircle, 
  Check, 
  HelpCircle,
  Eye,
  EyeOff,
  Coins
} from 'lucide-react';

export default function PrivacyComparison() {
  const comparisons = [
    {
      metric: 'Sender Identity on Ledger',
      cloakpay: { value: 'Completely Concealed', sub: 'Shielded Orchard pool', status: 'pass' },
      lightning: { value: 'Node Pubkey Leaked', sub: 'Channel topology exposed', status: 'warn' },
      walletconnect: { value: 'Public Ledger Address', sub: 'All balances & history linked', status: 'fail' },
      stripe: { value: 'Legal Name & Card Info', sub: 'Billing address & full KYC', status: 'fail' },
    },
    {
      metric: 'Account Registration / KYC',
      cloakpay: { value: 'Zero Registration', sub: 'Pure HTTP 402 exchange', status: 'pass' },
      lightning: { value: 'Varies', sub: 'Often requires custodial account', status: 'warn' },
      walletconnect: { value: 'Wallet Connect Handshake', sub: 'Tracks connected apps', status: 'warn' },
      stripe: { value: 'Mandatory', sub: 'Phone, email, credit check', status: 'fail' },
    },
    {
      metric: 'IP & Metadata Tracking',
      cloakpay: { value: '0 Bytes Logged', sub: 'Direct shielded broadcast', status: 'pass' },
      lightning: { value: 'Node IP Discoverable', sub: 'Gossip protocol leaks IPs', status: 'fail' },
      walletconnect: { value: 'Infura / Alchemy Logging', sub: 'RPC providers log client IP', status: 'fail' },
      stripe: { value: 'Comprehensive Fingerprint', sub: 'Browser canvas, IP, fraud radar', status: 'fail' },
    },
    {
      metric: 'Heuristic Chain Clustering',
      cloakpay: { value: 'Cryptographically Immune', sub: 'Halo 2 zero-knowledge proofs', status: 'pass' },
      lightning: { value: 'Routing Timing Attacks', sub: 'Probing attacks link payments', status: 'warn' },
      walletconnect: { value: 'Fully Traceable', sub: 'Chainalysis / Arkham clusterable', status: 'fail' },
      stripe: { value: 'Centralized Database', sub: 'Shared with payment processors', status: 'fail' },
    },
    {
      metric: 'Payment Settlement Fee',
      cloakpay: { value: '~$0.0001 (0.00001 ZEC)', sub: 'Fixed standard network fee', status: 'pass' },
      lightning: { value: 'Variable Routing Fees', sub: 'Can spike during channel congestion', status: 'pass' },
      walletconnect: { value: '$0.05 – $15.00+ Gas', sub: 'Gas volatility on L1 / L2', status: 'fail' },
      stripe: { value: '2.9% + $0.30 Minimum', sub: 'Prohibitive for sub-$1 micro-charges', status: 'fail' },
    },
  ];

  return (
    <section id="comparison" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium mb-3">
            <EyeOff className="w-3.5 h-3.5 text-emerald-400" />
            <span>PRIVACY & ARCHITECTURE BENCHMARK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How CloakPay Compares
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base">
            Conventional payment gateways demand invasive identity verification or leak public transaction graphs. CloakPay offers mathematically verifiable anonymity.
          </p>
        </div>

        {/* Comparison Table Container */}
        <div className="rounded-3xl bg-cloak-900 border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              
              {/* Table Head */}
              <thead>
                <tr className="border-b border-white/10 bg-cloak-850/80">
                  <th className="py-5 px-6 text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Privacy Dimension
                  </th>
                  <th className="py-5 px-6 bg-emerald-950/40 border-x border-emerald-500/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-sm font-bold text-emerald-300 font-sans">
                        CloakPay (Zcash)
                      </span>
                    </div>
                  </th>
                  <th className="py-5 px-6 text-xs font-semibold text-slate-300">
                    Lightning (L402 / LSAT)
                  </th>
                  <th className="py-5 px-6 text-xs font-semibold text-slate-300">
                    WalletConnect (EVM/Sol)
                  </th>
                  <th className="py-5 px-6 text-xs font-semibold text-slate-300">
                    Stripe / Traditional
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-white/5 text-xs">
                {comparisons.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    
                    {/* Metric Name */}
                    <td className="py-4 px-6 font-medium text-slate-200">
                      {row.metric}
                    </td>

                    {/* CloakPay column (Highlighted) */}
                    <td className="py-4 px-6 bg-emerald-950/20 border-x border-emerald-500/20">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-white font-mono">
                            {row.cloakpay.value}
                          </div>
                          <div className="text-[11px] text-emerald-400/80 mt-0.5">
                            {row.cloakpay.sub}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Lightning column */}
                    <td className="py-4 px-6 text-slate-300">
                      <div>
                        <div className="font-semibold text-slate-200 font-mono">
                          {row.lightning.value}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {row.lightning.sub}
                        </div>
                      </div>
                    </td>

                    {/* WalletConnect column */}
                    <td className="py-4 px-6 text-slate-300">
                      <div>
                        <div className="font-semibold text-red-400/90 font-mono">
                          {row.walletconnect.value}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {row.walletconnect.sub}
                        </div>
                      </div>
                    </td>

                    {/* Stripe column */}
                    <td className="py-4 px-6 text-slate-300">
                      <div>
                        <div className="font-semibold text-red-400 font-mono">
                          {row.stripe.value}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {row.stripe.sub}
                        </div>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* Table Footer Insight */}
          <div className="p-4 bg-cloak-950 border-t border-white/5 text-center text-xs text-slate-400 font-mono">
            <span>
              Summary: CloakPay uniquely decouples HTTP 402 micro-payment authorization from user identity and wallet clustering.
            </span>
          </div>
        </div>

      </div>
    </section>
  );
}

