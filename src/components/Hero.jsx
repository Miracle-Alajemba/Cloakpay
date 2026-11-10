import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { 
  ArrowRight, 
  Code2, 
  Shield, 
  Terminal, 
  Wallet, 
  KeyRound, 
  CheckCircle2 
} from 'lucide-react';

export default function Hero({ onExploreDemo }) {
  const heroRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const flowRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.6 }
      )
      .fromTo(
        titleRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.3'
      )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.5'
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.4'
      )
      .fromTo(
        flowRef.current?.children || [],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.12, duration: 0.6 },
        '-=0.3'
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleScrollTo = (e, targetId) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section ref={heroRef} className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden border-b border-white/5">
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[420px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Hero Header */}
        <div className="max-w-3xl mx-auto text-center">
          
          {/* Audience / Category Badge */}
          <div ref={badgeRef} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-mono mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Built for API Providers & Sovereign Developers</span>
          </div>

          {/* Exact Headline: Clean, crisp font-semibold */}
          <h1 
            ref={titleRef} 
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white tracking-[-0.025em] leading-[1.15] font-display"
          >
            Pay for one API request—not a subscription.
          </h1>

          {/* Exact Supporting Text: Clean uninterrupted font-sans prose without inline pills */}
          <p 
            ref={subtitleRef} 
            className="mt-6 text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto font-sans"
          >
            CloakPay helps API providers charge per request in shielded ZEC. A user pays from a Zcash wallet, and access is granted after the payment is verified—without creating a CloakPay account.
          </p>

          {/* Action-Oriented Buttons (Matching working page anchors) */}
          <div ref={ctaRef} className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onExploreDemo}
              className="px-6 py-3.5 rounded-xl font-medium text-sm text-cloak-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            >
              <span>Try the interactive demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#developers"
              onClick={(e) => handleScrollTo(e, 'developers')}
              className="px-5 py-3.5 rounded-xl font-medium text-sm text-slate-200 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 transition-all flex items-center gap-2 backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            >
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>View developer integration</span>
            </a>
          </div>

        </div>

        {/* 3-Step Visual Flow: Clean, scannable steps right below the hero copy */}
        <div className="mt-16 sm:mt-20">
          <div className="text-center mb-6">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              The 3-Step Flow
            </span>
          </div>

          <div 
            ref={flowRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-cloak-900/80 border border-white/10 hover:border-emerald-500/30 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    Step 01
                  </span>
                  <Terminal className="w-4 h-4 text-slate-400" />
                </div>
                <h2 className="text-base font-semibold text-white mb-2 font-display">
                  Request a paid API resource.
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  The client calls a protected API endpoint. The provider returns a payment challenge containing the required amount and a session token.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-cloak-900/80 border border-white/10 hover:border-emerald-500/30 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    Step 02
                  </span>
                  <Wallet className="w-4 h-4 text-slate-400" />
                </div>
                <h2 className="text-base font-semibold text-white mb-2 font-display">
                  Receive a Zcash payment request and pay from a compatible wallet.
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  The user scans a ZIP-321 QR code or sends shielded ZEC with the session token in the encrypted memo. On-chain transaction details remain concealed from observers.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-cloak-900/80 border border-white/10 hover:border-emerald-500/30 transition-colors flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-semibold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    Step 03
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <h2 className="text-base font-semibold text-white mb-2 font-display">
                  CloakPay verifies the payment and grants access.
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  The provider detects the incoming transaction with its Incoming Viewing Key (IVK) and decrypts the session memo to release the API response.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Why Shielded Zcash Callout Bar */}
        <div className="mt-8 max-w-5xl mx-auto p-4 rounded-xl bg-cloak-900/50 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300 font-sans">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Why shielded Zcash?</strong> Orchard transactions keep the sender, recipient, and amount private on the public blockchain.
            </span>
          </div>
          <span className="text-slate-400 font-mono text-[11px] shrink-0">
            No accounts • No wallet-connect telemetry
          </span>
        </div>

      </div>
    </section>
  );
}
