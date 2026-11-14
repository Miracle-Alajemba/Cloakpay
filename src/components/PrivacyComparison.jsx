import React from 'react';
import {
  EyeOff,
  AlertCircle
} from 'lucide-react';

export default function PrivacyComparison() {
  const comparisons = [
    {
      metric: 'Sender Identity on Ledger',
      cloakpay: { value: 'Concealed when shielded', sub: 'Proposed design: sender address hidden from public blockchain when sending from shielded pool' },
      lightning: { value: 'Public node pubkey', sub: 'Routing node pubkeys are public; private channels offer variable privacy depending on setup' },
      publicChain: { value: 'Public wallet address', sub: 'Sender address and balance history visible on public ledger' },
      traditional: { value: 'Cardholder / account identity', sub: 'Card payments link legal name, billing address, and bank profile' },
    },
    {
      metric: 'Account Registration Requirement',
      cloakpay: { value: 'No account needed (Design goal)', sub: 'Planned per-request challenge; simulated in current demo' },
      lightning: { value: 'Varies by wallet / service', sub: 'Custodial wallets often require accounts; non-custodial nodes do not' },
      publicChain: { value: 'No account, but wallet required', sub: 'Transactions require a funded crypto wallet and signed payload' },
      traditional: { value: 'Mandatory registration / KYC', sub: 'Typically requires customer account, email, and billing profile' },
    },
    {
      metric: 'On-Chain Transaction Graph',
      cloakpay: { value: 'Concealed in shielded pool', sub: 'Planned use of Orchard shielded pool hides sender, recipient, and amount' },
      lightning: { value: 'Off-chain payment routing', sub: 'Individual payments not on-chain; routing channel capacity and topology are observable' },
      publicChain: { value: 'Public transaction graph', sub: 'Transfers, amounts, timestamps, and contract calls are publicly indexable' },
      traditional: { value: 'Centralized financial records', sub: 'Transactions stored internally across payment processors and banks' },
    },
    {
      metric: 'Network-Layer Metadata (IP / Prompt)',
      cloakpay: { value: 'Visible to API provider', sub: 'API provider receives prompt, IP address, and connection metadata' },
      lightning: { value: 'Visible to API & routing nodes', sub: 'API server and intermediate routing nodes may observe connection metadata' },
      publicChain: { value: 'Visible to API & RPC providers', sub: 'API server and RPC endpoint providers can observe client IP address' },
      traditional: { value: 'Visible to processor & provider', sub: 'Processor and merchant log IP address, browser fingerprint, and metadata' },
    },
    {
      metric: 'Network Fee Structure (Illustrative)',
      cloakpay: { value: 'Low network fee model', sub: 'Standard network transaction fee paid to Zcash miners; distinct from the API price set by provider' },
      lightning: { value: 'Variable routing fees', sub: 'Base fee plus proportional fee per hop; depends on route length and channel liquidity' },
      publicChain: { value: 'Variable gas fees', sub: 'Fluctuates with network congestion and smart contract execution complexity' },
      traditional: { value: 'Processor fee structure', sub: 'Typically percentage plus fixed per-transaction fee; often impractical for micro-transactions' },
    },
  ];

  return (
    <section id="comparison" className="py-20 relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono mb-3">
            <EyeOff className="w-3.5 h-3.5 text-emerald-700" />
            <span>Privacy & Architecture Benchmark</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-[-0.025em] font-display">
            How CloakPay compares to traditional and Web3 payment models
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed font-sans max-w-2xl mx-auto">
            Traditional gateways require subscriptions and accounts. Public blockchains expose persistent wallet addresses. CloakPay proposes per-request micropayments using shielded Zcash (currently simulated).
          </p>
        </div>

        {/* Comparison Table Container */}
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">

              {/* Table Head */}
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="py-4 px-6 text-xs font-mono text-slate-600 uppercase tracking-wider">
                    Feature / Property
                  </th>
                  <th className="py-4 px-6 bg-emerald-50/70 border-x border-emerald-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-sm font-semibold text-emerald-950 font-sans">
                          CloakPay (Proposed Zcash Model)
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-800 font-mono block mt-0.5">
                        Design Goal • Demo Simulated
                      </span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-xs font-medium text-slate-700">
                    Lightning (L402 / LSAT)
                  </th>
                  <th className="py-4 px-6 text-xs font-medium text-slate-700">
                    Public On-Chain (EVM / Solana)
                  </th>
                  <th className="py-4 px-6 text-xs font-medium text-slate-700">
                    Traditional Card Gateways
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-100 text-xs font-sans">
                {comparisons.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">

                    {/* Metric Name */}
                    <td className="py-4 px-6 font-medium text-slate-900">
                      {row.metric}
                    </td>

                    {/* CloakPay column (Highlighted) */}
                    <td className="py-4 px-6 bg-emerald-50/30 border-x border-emerald-200">
                      <div>
                        <div className="font-semibold text-slate-900">
                          {row.cloakpay.value}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          {row.cloakpay.sub}
                        </div>
                      </div>
                    </td>

                    {/* Lightning column */}
                    <td className="py-4 px-6 text-slate-700">
                      <div>
                        <div className="font-medium text-slate-900">
                          {row.lightning.value}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {row.lightning.sub}
                        </div>
                      </div>
                    </td>

                    {/* Public On-Chain column */}
                    <td className="py-4 px-6 text-slate-700">
                      <div>
                        <div className="font-medium text-slate-900">
                          {row.publicChain.value}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {row.publicChain.sub}
                        </div>
                      </div>
                    </td>

                    {/* Traditional column */}
                    <td className="py-4 px-6 text-slate-700">
                      <div>
                        <div className="font-medium text-slate-900">
                          {row.traditional.value}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {row.traditional.sub}
                        </div>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>

          {/* Cryptographic & Operational Boundary Note */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-start gap-2.5 text-xs text-slate-600 font-sans">
            <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Technical boundary:</strong> Shielded Zcash can hide transaction details from public blockchain observers when shielded transactions are used. It does not make API use anonymous: the API provider can see the request it receives and may receive the caller’s IP address and connection metadata. CloakPay’s current demo simulates payment verification; it does not send real ZEC.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
