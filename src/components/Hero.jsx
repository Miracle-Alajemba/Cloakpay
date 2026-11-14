import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  ArrowRight,
  Shield,
  CheckCircle2,
  ArrowUpRight,
  Radio
} from 'lucide-react';

export default function Hero({ onExploreDemo, backendHealth = {}, onOpenPaywall }) {
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
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.35 }
      )
      .fromTo(
        titleRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5 },
        '-=0.15'
      )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4 },
        '-=0.2'
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.35 },
        '-=0.15'
      )
      .fromTo(
        previewRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5 },
        '-=0.25'
      )
      .fromTo(
        flowRef.current?.children || [],
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, stagger: 0.06, duration: 0.35 },
        '-=0.15'
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
    <section ref={heroRef} className="relative pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-[#fafaf9] via-white to-[#fafaf9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Asymmetric 2-Column Split: Editorial Positioning & Product Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

          {/* Left Column (7 cols): Editorial Product Positioning & Actions */}
          <div className="lg:col-span-7 text-left">

            {/* Live Network & Service Badge: queried directly from /api/health */}
            <div ref={badgeRef} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white border border-slate-200/90 text-xs font-mono mb-5 shadow-xs">
              {backendHealth.online && backendHealth.scannerReady ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="text-emerald-800 font-medium">Zcash Testnet Scanner Connected</span>
                </>
              ) : backendHealth.online ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-amber-800 font-medium">Zcash Testnet Scanner Syncing</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  <span className="text-slate-600 font-medium">Standalone Simulator Ready</span>
                </>
              )}
            </div>

            {/* Clear Product Headline */}
            <h1
              ref={titleRef}
              className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-900 tracking-[-0.025em] leading-[1.15] font-display max-w-2xl"
            >
              Pay for one API request. Not a subscription.
            </h1>

            {/* Concise Plain-Language Description: No em dashes, no slashes */}
            <p
              ref={subtitleRef}
              className="mt-5 text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-xl font-sans"
            >
              CloakPay helps API providers charge per request in shielded ZEC. A user pays from a Zcash wallet, and access is granted after the payment is verified without creating a CloakPay account.
            </p>

            {/* Actions: Primary to Workbench, Secondary to Developers */}
            <div ref={ctaRef} className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#demo"
                onClick={(e) => {
                  e.preventDefault();
                  onExploreDemo();
                }}
                className="px-5 py-2.5 rounded-md font-medium text-sm text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
              >
                <span>Try the interactive demo</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#developers"
                onClick={(e) => handleScrollTo(e, 'developers')}
                className="px-5 py-2.5 rounded-md font-medium text-sm text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/90 transition-colors flex items-center gap-2 shadow-xs focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
              >
                <span>View developer integration</span>
              </a>
            </div>

            {/* Brief Payment Status Disclosure near action */}
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Includes Live Zcash Testnet (0.001 TAZ) and Standalone Simulator modes.</span>
            </div>

          </div>

          {/* Right Column (5 cols): Product Interface Preview */}
          <div ref={previewRef} className="lg:col-span-5 w-full">
            <div className="rounded-xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/40 overflow-hidden text-left">

              {/* Product Window Topbar */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono font-medium text-slate-700">HTTP 402 Paywall Gateway</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  RFC 9110
                </span>
              </div>

              {/* Product Flow Card */}
              <div className="p-5 space-y-4 font-sans">

                {/* Resource Header */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>Protected Endpoint</span>
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      HTTP 402 Payment Required
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 font-mono">
                    POST /v1/chat/completions
                  </div>
                </div>

                {/* Pricing & Pool Breakdown */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-slate-200/80 space-y-1 shadow-2xs">
                    <span className="text-slate-500 block font-mono text-[11px]">Request Price</span>
                    <span className="text-base font-bold text-slate-900 font-mono tabular-nums">0.001 TAZ</span>
                    <span className="text-[11px] text-slate-500 block font-mono">100,000 zatoshis</span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200/80 space-y-1 shadow-2xs">
                    <span className="text-slate-500 block font-mono text-[11px]">Settlement Pool</span>
                    <span className="text-sm font-semibold text-slate-900 block">Shielded Orchard</span>
                    <span className="text-[11px] text-emerald-700 block font-mono">ZIP-321 Memo Note</span>
                  </div>
                </div>

                {/* Interactive Action Preview */}
                <button
                  type="button"
                  onClick={onOpenPaywall}
                  className="w-full p-3 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 flex items-center justify-between text-xs transition-colors cursor-pointer group text-left"
                >
                  <div className="flex items-center gap-2.5 text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">Open payment challenge dialog</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-emerald-700 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </button>

              </div>

              {/* Product Window Footer */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>ZIP-321 and RFC 9110 Specification</span>
                <span className="text-emerald-700 font-medium">No Account Needed</span>
              </div>

            </div>
          </div>

        </div>

        {/* 3-Step Clear Visual Flow */}
        <div ref={flowRef} className="mt-14 pt-10 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">

          <div className="p-4 rounded-lg bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-semibold">1</span>
              <h3 className="text-sm font-semibold text-slate-900 font-sans">Request a paid API resource.</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans pl-7">
              The client queries a protected endpoint without credentials. The gateway replies with HTTP 402 and an ephemeral challenge.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-semibold">2</span>
              <h3 className="text-sm font-semibold text-slate-900 font-sans">Receive a Zcash payment request and pay from a compatible wallet.</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans pl-7">
              The customer scans a standard ZIP-321 QR code. The wallet auto-fills the recipient address, exact amount, and session memo.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-white border border-slate-200/80 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-semibold">3</span>
              <h3 className="text-sm font-semibold text-slate-900 font-sans">CloakPay verifies the payment and grants access.</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans pl-7">
              The watch-only scanner detects the matching shielded note on-chain. Once confirmed, the requested payload is unlocked.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
