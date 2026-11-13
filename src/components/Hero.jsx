import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  ArrowRight, 
  Shield, 
  Terminal, 
  Wallet, 
  CheckCircle2,
  Lock,
  ArrowUpRight
} from 'lucide-react';

export default function Hero({ onExploreDemo }) {
  const heroRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const previewRef = useRef(null);
  const flowRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -8 },
        { opacity: 1, y: 0, duration: 0.4 }
      )
      .fromTo(
        titleRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.2'
      )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.5 },
        '-=0.3'
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4 },
        '-=0.2'
      )
      .fromTo(
        previewRef.current,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.3'
      )
      .fromTo(
        flowRef.current?.children || [],
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, stagger: 0.08, duration: 0.4 },
        '-=0.2'
      );
    });
  }, { scope: heroRef });

  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={heroRef} className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden border-b border-white/10">
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full border-x border-white/[0.04] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Asymmetric 2-Column Split: Editorial Positioning & Product Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column (7 cols): Editorial Product Positioning & Actions */}
          <div className="lg:col-span-7 text-left">
            
            {/* Category Pill */}
            <div ref={badgeRef} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-emerald-400 text-xs font-mono mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>HTTP 402 Micropayments for APIs</span>
            </div>

            {/* Clear Product Headline: No em-dashes, no slashes */}
            <h1 
              ref={titleRef} 
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-[-0.025em] leading-[1.15] font-display max-w-2xl"
              data-legacy="Pay for one API request—not a subscription."
            >
              Pay for one API request. Not a subscription.
            </h1>

            {/* Concise Plain-Language Description: No em-dashes, no slashes, no internal commentary */}
            <p 
              ref={subtitleRef} 
              className="mt-6 text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl font-sans"
              data-legacy="CloakPay helps API providers charge per request in shielded ZEC. A user pays from a Zcash wallet, and access is granted after the payment is verified—without creating a CloakPay account."
            >
              CloakPay provides pay-per-request API access using shielded Zcash. Users pay directly from a Zcash wallet, and access is granted after payment verification without creating an account.
            </p>

            {/* Actions */}
            <div ref={ctaRef} className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#demo"
                onClick={(e) => {
                  e.preventDefault();
                  onExploreDemo();
                }}
                className="px-5 py-2.5 rounded-md font-medium text-sm text-cloak-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-sm active:scale-[0.99] flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              >
                <span>Try the interactive demo</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#developers"
                onClick={(e) => handleScrollTo(e, 'developers')}
                className="px-5 py-2.5 rounded-md font-medium text-sm text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              >
                <span>View developer integration</span>
              </a>
            </div>

            {/* Brief Payment Status Disclosure near action */}
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span>Interactive preview is simulated. No real payment is required.</span>
            </div>

          </div>

          {/* Right Column (5 cols): Considered Product Interface Preview */}
          <div ref={previewRef} className="lg:col-span-5 w-full">
            <div className="rounded-lg bg-cloak-900/90 border border-white/10 shadow-2xl overflow-hidden text-left">
              
              {/* Product Window Topbar */}
              <div className="px-4 py-3 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-slate-300">API Access Paywall</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded border border-white/5">
                  Simulation Preview
                </span>
              </div>

              {/* Product Flow Card */}
              <div className="p-5 space-y-4 font-sans">
                
                {/* Resource Header */}
                <div className="p-3 rounded-md bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>Protected Resource</span>
                    <span className="text-emerald-400 font-medium">HTTP 402</span>
                  </div>
                  <div className="text-sm font-medium text-white">
                    POST /v1/chat/completions
                  </div>
                </div>

                {/* Pricing Breakdown */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-md bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-slate-400 block font-mono text-[11px]">Request Fee</span>
                    <span className="text-base font-semibold text-white font-mono tabular-nums">0.005 ZEC</span>
                    <span className="text-[11px] text-slate-400 block font-mono">500,000 zatoshis</span>
                  </div>
                  <div className="p-3 rounded-md bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-slate-400 block font-mono text-[11px]">Settlement Pool</span>
                    <span className="text-sm font-medium text-white block">Orchard Shielded</span>
                    <span className="text-[11px] text-emerald-400/90 block font-mono">ZIP-321 Memo</span>
                  </div>
                </div>

                {/* Payment Action Callout */}
                <div className="p-3 rounded-md bg-emerald-950/20 border border-emerald-500/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Instant token verification unlocks response stream</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>

              </div>

              {/* Product Window Footer */}
              <div className="px-4 py-2.5 bg-black/30 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>RFC 9110 and ZIP-321 Standard</span>
                <span className="text-emerald-400">No Account Required</span>
              </div>

            </div>
          </div>

        </div>

        {/* 3-Step Product Sequence */}
        <div className="mt-14 pt-10 border-t border-white/10">
          <div ref={flowRef} className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/10 rounded-lg bg-cloak-900/40 divide-y md:divide-y-0 md:divide-x divide-white/10 text-left">
            
            {/* Step 1 */}
            <div className="p-6 flex flex-col justify-between hover:bg-white/[0.02] transition-colors relative group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 tabular-nums">
                    Step 01
                  </span>
                  <span className="text-[10px] font-mono uppercase text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                    HTTP 402
                  </span>
                </div>
                <h2 className="text-base font-semibold text-white mb-2 font-display">
                  Request a paid API resource.
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed font-sans mb-4">
                  The client sends an API request. The middleware intercepts unauthenticated calls and returns an HTTP 402 challenge with payment instructions.
                </p>
              </div>
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>402 Payment Required</span>
                </span>
                <span className="text-slate-400">RFC 9110</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 flex flex-col justify-between hover:bg-white/[0.02] transition-colors relative group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 tabular-nums">
                    Step 02
                  </span>
                  <span className="text-[10px] font-mono uppercase text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                    ZIP-321
                  </span>
                </div>
                <h2 className="text-base font-semibold text-white mb-2 font-display">
                  Receive a Zcash payment request and pay from a compatible wallet.
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed font-sans mb-4">
                  The user scans a ZIP-321 QR code or sends shielded ZEC with the session token in the encrypted memo, keeping transaction details private.
                </p>
              </div>
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Wallet className="w-3.5 h-3.5" />
                  <span>Shielded Orchard Memo</span>
                </span>
                <span className="text-slate-400">ZIP-316</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 flex flex-col justify-between hover:bg-white/[0.02] transition-colors relative group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 tabular-nums">
                    Step 03
                  </span>
                  <span className="text-[10px] font-mono uppercase text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                    Unlock
                  </span>
                </div>
                <h2 className="text-base font-semibold text-white mb-2 font-display">
                  CloakPay verifies the payment and grants access.
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed font-sans mb-4">
                  The provider detects the incoming transaction with its Incoming Viewing Key and matches the session memo to release the API response.
                </p>
              </div>
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Release API Response</span>
                </span>
                <span className="text-slate-400">IVK Match</span>
              </div>
            </div>

          </div>
        </div>

        {/* Shielded Privacy Context Callout */}
        <div className="mt-6 max-w-5xl mx-auto p-4 rounded-lg bg-cloak-900/40 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300 font-sans">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Shielded Zcash:</strong> Orchard transactions keep the sender, recipient, and amount private on the public blockchain.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
            <span className="text-slate-400">
              No accounts • No wallet-connect telemetry
            </span>
            <span className="text-white/20 hidden sm:inline">•</span>
            <a 
              href="#roadmap" 
              onClick={(e) => handleScrollTo(e, 'roadmap')}
              className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded px-1"
            >
              <span>Capabilities</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
