import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  EyeOff, 
  Sparkles, 
  Layers, 
  Cpu, 
  KeyRound, 
  CheckCircle2,
  FileCode2,
  Coins
} from 'lucide-react';

export default function Hero({ onExploreDemo }) {
  const heroRef = useRef(null);
  const badgeRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const statsRef = useRef(null);
  const shieldGraphicRef = useRef(null);
  const floatingCardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main Entrance Timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7 }
      )
      .fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.9 },
        '-=0.4'
      )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.6'
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.5'
      )
      .fromTo(
        statsRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.6 },
        '-=0.4'
      )
      .fromTo(
        shieldGraphicRef.current,
        { opacity: 0, scale: 0.9, rotateY: 15 },
        { opacity: 1, scale: 1, rotateY: 0, duration: 1.1, ease: 'back.out(1.2)' },
        '-=0.9'
      );

      // Continuous subtle levitation on floating visual cards
      floatingCardsRef.current.forEach((card, index) => {
        if (!card) return;
        gsap.to(card, {
          y: (index % 2 === 0 ? -12 : 10),
          duration: 3 + index * 0.8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.4
        });
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background radial spotlights & ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[400px] bg-amber-500/5 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline and Value Proposition */}
          <div className="lg:col-span-7 text-center lg:text-left">
            {/* Protocol Badge */}
            <div ref={badgeRef} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono tracking-wide mb-6">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-emerald-400">HTTP 402 SPECIFICATION</span>
              <span className="text-slate-500">•</span>
              <span>ZERO-METADATA MEMO PROTOCOL</span>
            </div>

            {/* Main Headline */}
            <h1 ref={titleRef} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] font-display">
              The{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                HTTP 402
              </span>{' '}
              Micropayment Gateway
              <br className="hidden sm:block" />
              {' '}for{' '}
              <span className="bg-gradient-to-r from-white via-slate-200 to-emerald-300 bg-clip-text text-transparent">
                AI&nbsp;&amp;&nbsp;Media
              </span>.
            </h1>

            {/* Subtitle with core Zcash value prop — Stripe/Linear editorial styling */}
            <p ref={subtitleRef} className="mt-6 text-base sm:text-lg text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto lg:mx-0 font-sans">
              Powered by{' '}
              <span className="text-white font-medium">Zcash Encrypted Memos</span>{' '}
              and{' '}
              <span className="font-mono text-[0.85em] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">ZIP-321 URIs</span>.
              {' '}No user accounts. No invasive wallet-connect tracking.{' '}
              <span className="text-white font-medium">Zero&nbsp;IP&nbsp;or&nbsp;telemetry&nbsp;leakage</span>.
              {' '}Unlock paywalled LLM inferences, confidential research, and digital assets
              in sub-second mempool broadcasts.
            </p>

            {/* Action Buttons */}
            <div ref={ctaRef} className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onExploreDemo}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm text-cloak-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 transition-all shadow-xl shadow-emerald-500/25 active:scale-95 flex items-center gap-2 group cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-cloak-950" />
                Try Interactive AI Paywall
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <a
                href="#protocol"
                className="px-5 py-3.5 rounded-xl font-medium text-sm text-slate-200 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 transition-all flex items-center gap-2 backdrop-blur-md"
              >
                <FileCode2 className="w-4 h-4 text-emerald-400" />
                How It Works (RFC 9110)
              </a>
            </div>

            {/* Trust & Spec Highlights */}
            <div ref={statsRef} className="mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
                  <EyeOff className="w-3.5 h-3.5" />
                  Zero Metadata
                </div>
                <div className="mt-1 text-2xl font-bold text-white font-mono">0 Bytes</div>
                <div className="text-xs text-slate-400 mt-0.5">Identity or IP logged</div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Shielded Pool
                </div>
                <div className="mt-1 text-2xl font-bold text-white font-mono">Orchard</div>
                <div className="text-xs text-slate-400 mt-0.5">Halo 2 ZK proofs</div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
                  <Cpu className="w-3.5 h-3.5" />
                  Mempool Speed
                </div>
                <div className="mt-1 text-2xl font-bold text-white font-mono">&lt; 1.2s</div>
                <div className="text-xs text-slate-400 mt-0.5">Instant IVK match</div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
                  <Coins className="w-3.5 h-3.5" />
                  Micro-Cost
                </div>
                <div className="mt-1 text-2xl font-bold text-white font-mono">$0.0001</div>
                <div className="text-xs text-slate-400 mt-0.5">Zcash network fee</div>
              </div>
            </div>

          </div>

          {/* Right Column: Visual Graphic - Interactive Shield & Protocol Flow Architecture */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Glowing Backdrop Canvas */}
            <div 
              ref={shieldGraphicRef} 
              className="relative w-full max-w-md p-6 rounded-3xl glass-panel-glow border border-emerald-500/30 overflow-hidden shadow-2xl shadow-emerald-950/60"
            >
              {/* Subtle top sheen */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
              
              {/* Header inside graphic */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-[11px] font-mono text-emerald-300 flex items-center gap-1.5 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  <Lock className="w-3 h-3" />
                  <span>zcashd::orchard_mempool</span>
                </div>
              </div>

              {/* Protocol Diagram Card */}
              <div className="mt-5 space-y-3 font-mono text-xs">
                
                {/* Step 1: HTTP 402 Request */}
                <div 
                  ref={el => floatingCardsRef.current[0] = el}
                  className="p-3.5 rounded-xl bg-cloak-900/90 border border-white/10 flex items-start gap-3 shadow-lg"
                >
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
                    <span className="font-bold text-xs">402</span>
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-slate-300 font-semibold flex items-center gap-2">
                      <span>HTTP 402 Payment Required</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5 truncate">
                      X-Payment-URI: zcash:u1...?amount=0.005
                    </p>
                    <div className="mt-1 text-[10px] text-emerald-400/90">
                      Memo payload: CloakPay:sess_0x9e14a8
                    </div>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="flex justify-center text-slate-500">
                  <div className="h-4 w-px bg-emerald-500/30" />
                </div>

                {/* Step 2: Shielded Mempool Detection */}
                <div 
                  ref={el => floatingCardsRef.current[1] = el}
                  className="p-3.5 rounded-xl bg-gradient-to-br from-cloak-850 to-emerald-950/40 border border-emerald-500/30 flex items-start gap-3 shadow-lg relative overflow-hidden"
                >
                  <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                  <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-white font-semibold flex items-center gap-2">
                      <span>Encrypted Memo Detected</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                        ~0.8s
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Incoming Viewing Key (IVK) decrypts matching session hash inside shielded note.
                    </p>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="flex justify-center text-slate-500">
                  <div className="h-4 w-px bg-emerald-500/30" />
                </div>

                {/* Step 3: Stream Unlocked */}
                <div 
                  ref={el => floatingCardsRef.current[2] = el}
                  className="p-3.5 rounded-xl bg-cloak-900/90 border border-white/10 flex items-start gap-3 shadow-lg"
                >
                  <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-slate-200 font-semibold flex items-center gap-2">
                      <span>HTTP 200 Stream Granted</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Token authenticated. Uncensored AI response streams without storing identity.
                    </p>
                  </div>
                </div>

              </div>

              {/* Bottom footer badge */}
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Zcash Mainnet & Testnet Ready
                </span>
                <span className="font-mono text-emerald-400">ZIP-321 Compatible</span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

