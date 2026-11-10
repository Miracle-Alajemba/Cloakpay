import React from 'react';
import { 
  Check, 
  EyeOff, 
  AlertCircle,
  HelpCircle,
  Shield
} from 'lucide-react';

export default function PrivacyComparison() {
  const comparisons = [
    {
      metric: 'Sender Identity on Ledger',
      cloakpay: { value: 'Shielded on-chain', sub: 'Sender address omitted from public blockchain', status: 'pass' },
      lightning: { value: 'Node pubkey exposed', sub: 'Routing channel topology observable', status: 'warn' },
      walletconnect: { value: 'Public account address', sub: 'All balances and past transactions linked', status: 'fail' },
      stripe: { value: 'Legal name & billing card', sub: 'Full identity, address, and KYC records', status: 'fail' },
    },
    {
      metric: 'Account Registration Requirement',
      cloakpay: { value: 'No account needed', sub: 'Access authenticated per-request via memo', status: 'pass' },
      lightning: { value: 'Often requires account', sub: 'Custodial LN apps typically require login', status: 'warn' },
      walletconnect: { value: 'Wallet connection', sub: 'dApps prompt signature and track sessions', status: 'warn' },
      stripe: { value: 'Mandatory registration', sub: 'Account, email, and payment profile required', status: 'fail' },
    },
    {
      metric: 'On-Chain Transaction Graph',
      cloakpay: { value: 'Shielded note pool', sub: 'Orchard Halo 2 zero-knowledge proofs', status: 'pass' },
      lightning: { value: 'Channel balance probes', sub: 'Probing attacks can link route balances', status: 'warn' },
      walletconnect: { value: 'Fully public graph', sub: 'Transactions indexable by block explorers', status: 'fail' },
      stripe: { value: 'Centralized database', sub: 'Records stored across financial institutions', status: 'fail' },
    },
    {
      metric: 'Network-Layer Metadata (IP / Prompt)',
      cloakpay: { value: 'Visible to API server', sub: 'Server sees caller IP and prompt; on-chain payment is shielded', status: 'info' },
      lightning: { value: 'Visible to node & server', sub: 'Gossip protocol and API server see caller IP', status: 'info' },
      walletconnect: { value: 'Logged by RPC providers', sub: 'RPC nodes (Infura/Alchemy) log IP addresses', status: 'fail' },
      stripe: { value: 'Full device fingerprint', sub: 'Fraud engine tracks IP, canvas, and browser fingerprint', status: 'fail' },
    },
    {
      metric: 'Typical Settlement Cost',
      cloakpay: { value: '~$0.0001 (0.00001 ZEC)', sub: 'Standard fixed network fee', status: 'pass' },
      lightning: { value: 'Variable routing fee', sub: 'Varies with network liquidity and route hops', status: 'pass' },
      walletconnect: { value: '$0.05 – $10.00+ Gas', sub: 'Subject to blockchain congestion spikes', status: 'fail' },
      stripe: { value: '2.9% + $0.30 Minimum', sub: 'Prohibitive for individual sub-dollar API calls', status: 'fail' },
    },
  ];

  return (
    <section id="comparison" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-3">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Privacy & Architecture Benchmark</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-[-0.025em] font-display">
            How CloakPay compares to traditional and Web3 payment models
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed font-sans max-w-2xl mx-auto">
            Traditional gateways require subscriptions and accounts. Public blockchains expose persistent wallet addresses. CloakPay enables per-request payments using shielded Zcash.
          </p>
        </div>

        {/* Comparison Table Container */}
        <div className="rounded-2xl bg-cloak-900 border border-white/10 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              
              {/* Table Head */}
              <thead>
                <tr className="border-b border-white/10 bg-cloak-850/80">
                  <th className="py-4 px-6 text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Feature / Property
                  </th>
                  <th className="py-4 px-6 bg-emerald-950/30 border-x border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-300 font-sans">
                        CloakPay (Zcash)
                      </span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-xs font-medium text-slate-300">
                    Lightning (L402 / LSAT)
                  </th>
                  <th className="py-4 px-6 text-xs font-medium text-slate-300">
                    WalletConnect (EVM / Sol)
                  </th>
                  <th className="py-4 px-6 text-xs font-medium text-slate-300">
                    Stripe / Traditional
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-white/5 text-xs font-sans">
                {comparisons.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    
                    {/* Metric Name */}
                    <td className="py-4 px-6 font-medium text-slate-200">
                      {row.metric}
                    </td>

                    {/* CloakPay column (Highlighted) */}
                    <td className="py-4 px-6 bg-emerald-950/15 border-x border-emerald-500/20">
                      <div>
                        <div className="font-semibold text-white">
                          {row.cloakpay.value}
                        </div>
                        <div className="text-[11px] text-slate-300 mt-0.5">
                          {row.cloakpay.sub}
                        </div>
                      </div>
                    </td>

                    {/* Lightning column */}
                    <td className="py-4 px-6 text-slate-300">
                      <div>
                        <div className="font-medium text-slate-200">
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
                        <div className="font-medium text-red-400">
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
                        <div className="font-medium text-red-400">
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

          {/* Cryptographic Boundary Clarification */}
          <div className="p-4 bg-cloak-950 border-t border-white/5 flex items-start gap-2.5 text-xs text-slate-300 font-sans">
            <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Technical boundary:</strong> Zcash shielding ensures transaction details on the blockchain cannot be correlated by third-party observers. 
              However, calling an API server inherently transmits your HTTP request (IP address, TLS session, and prompt) to that server. 
              Zcash shielding does not automatically hide network-layer metadata or API prompts from the destination API server.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
