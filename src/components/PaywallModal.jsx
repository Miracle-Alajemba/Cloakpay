import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Copy, 
  Check, 
  ShieldCheck, 
  Clock, 
  Radio, 
  Sparkles, 
  Zap, 
  ExternalLink, 
  AlertCircle,
  HelpCircle,
  QrCode,
  Shield,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaywallModal({ isOpen, onClose, onPaymentSuccess, sessionId, queryPrompt }) {
  const modalBackdropRef = useRef(null);
  const modalBoxRef = useRef(null);

  // Zcash ZIP-321 details
  const amountZEC = '0.005';
  const usdValue = '~$0.18';
  const zcashUnifiedAddress = 'u1m6f94r727tt69g2sqg0x7x3a5h4g2k7w90mclp49q8vj9e450nsl8270xvw3v8w6n72u03h8xrqsqq48dyp';
  const memoString = `CloakPay:${sessionId || 'sess_9e14a8f9c'}`;
  
  // Standard ZIP-321 URI
  const zip321Uri = `zcash:${zcashUnifiedAddress}?amount=${amountZEC}&memo=${encodeURIComponent(memoString)}`;

  // State management
  const [copiedField, setCopiedField] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [paymentStatus, setPaymentStatus] = useState('waiting'); // 'waiting' | 'broadcasting' | 'verifying' | 'confirmed'
  const [tab, setTab] = useState('qr'); // 'qr' | 'manual' | 'wallets'

  // GSAP Spring Entrance
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const ctx = gsap.context(() => {
        gsap.fromTo(
          modalBackdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
        gsap.fromTo(
          modalBoxRef.current,
          { opacity: 0, scale: 0.85, y: 30 },
          { 
            opacity: 1, 
            scale: 1, 
            y: 0, 
            duration: 0.45, 
            ease: 'back.out(1.5)',
            delay: 0.05
          }
        );
      });
      return () => {
        document.body.style.overflow = 'unset';
        ctx.revert();
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(300);
      setPaymentStatus('waiting');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // GSAP Smooth Exit Animation Handler
  const handleAnimatedClose = (callback) => {
    if (modalBoxRef.current && modalBackdropRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          if (callback) {
            callback();
          } else {
            onClose();
          }
        }
      });

      tl.to(modalBoxRef.current, {
        opacity: 0,
        scale: 0.92,
        y: 15,
        duration: 0.3,
        ease: 'power2.in'
      }, 0)
      .to(modalBackdropRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
      }, 0.05);
    } else {
      if (callback) callback();
      else onClose();
    }
  };

  // Simulate Payment broadcast & verification
  const handleSimulatePayment = () => {
    setPaymentStatus('broadcasting');

    setTimeout(() => {
      setPaymentStatus('verifying');

      setTimeout(() => {
        setPaymentStatus('confirmed');

        // Confetti celebration
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#f4b728', '#ffffff', '#2dd4bf'],
        });

        // Trigger graceful GSAP exit after user sees success confirmation
        setTimeout(() => {
          handleAnimatedClose(() => {
            onPaymentSuccess();
          });
        }, 1000);
      }, 1200);
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        ref={modalBackdropRef}
        onClick={() => {
          if (paymentStatus !== 'verifying' && paymentStatus !== 'confirmed') {
            handleAnimatedClose(onClose);
          }
        }}
        className="fixed inset-0 bg-cloak-950/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog Window */}
      <div
        ref={modalBoxRef}
        className="relative w-full max-w-lg rounded-3xl bg-cloak-900 border border-emerald-500/30 shadow-2xl shadow-emerald-950/70 overflow-hidden z-10"
      >
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Modal Top Header */}
        <div className="relative px-6 py-5 border-b border-white/10 flex items-center justify-between bg-cloak-850/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-sans">
                  CloakPay Shielded Paywall
                </h3>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                  HTTP 402
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Session Token: <span className="text-emerald-400">{sessionId || 'sess_9e14a8f9c'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => handleAnimatedClose(onClose)}
            disabled={paymentStatus === 'verifying' || paymentStatus === 'confirmed'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 cursor-pointer"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* Amount and pricing summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cloak-850 to-emerald-950/40 border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block">
                Required Micropayment
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-extrabold text-white font-mono">
                  {amountZEC} <span className="text-emerald-400">ZEC</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({usdValue})
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-mono">
                Shielded Pool
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full mt-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                Orchard (ZIP-321)
              </span>
            </div>
          </div>

          {/* Navigation sub-tabs */}
          <div className="flex rounded-xl bg-cloak-950 p-1 border border-white/5 text-xs font-medium">
            <button
              onClick={() => setTab('qr')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'qr'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              ZIP-321 QR Code
            </button>
            <button
              onClick={() => setTab('manual')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'manual'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Address & Memo
            </button>
            <button
              onClick={() => setTab('wallets')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'wallets'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Wallets
            </button>
          </div>

          {/* TAB 1: QR Code Scanner */}
          {tab === 'qr' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative p-4 rounded-2xl bg-white shadow-xl shadow-emerald-500/10 group">
                {/* Visual frame corners */}
                <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-emerald-500" />
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-emerald-500" />
                <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-emerald-500" />
                <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-emerald-500" />

                <QRCodeSVG
                  value={zip321Uri}
                  size={190}
                  level="M"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#06080d"
                />

                {/* Center Zcash icon overlay badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-slate-950 border-2 border-emerald-400 flex items-center justify-center shadow-lg">
                    <span className="font-extrabold text-emerald-400 font-mono text-sm leading-none">
                      Z
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-slate-300 font-medium">
                  Scan with any mobile Zcash wallet (Zashi, YWallet, Zingo!)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Amount and encrypted session memo are pre-filled automatically via ZIP-321
                </p>
              </div>

              {/* Quick Copy ZIP-321 URI button */}
              <button
                onClick={() => copyToClipboard(zip321Uri, 'uri')}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2 font-mono cursor-pointer"
              >
                {copiedField === 'uri' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied ZIP-321 URI to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Full ZIP-321 URI</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: Manual Copy Fields */}
          {tab === 'manual' && (
            <div className="space-y-3 font-mono text-xs">
              {/* Address field */}
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px] flex items-center justify-between">
                  <span>Zcash Unified Shielded Address (u1...)</span>
                  <button
                    onClick={() => copyToClipboard(zcashUnifiedAddress, 'address')}
                    className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {copiedField === 'address' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedField === 'address' ? 'Copied' : 'Copy'}
                  </button>
                </label>
                <div className="p-2.5 rounded-xl bg-cloak-950 border border-white/10 text-slate-300 text-[11px] break-all leading-relaxed select-all">
                  {zcashUnifiedAddress}
                </div>
              </div>

              {/* Memo field */}
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    Required Encrypted Memo (Session Token)
                  </span>
                  <button
                    onClick={() => copyToClipboard(memoString, 'memo')}
                    className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {copiedField === 'memo' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedField === 'memo' ? 'Copied' : 'Copy'}
                  </button>
                </label>
                <div className="p-2.5 rounded-xl bg-cloak-950 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-between">
                  <span>{memoString}</span>
                  <span className="text-[10px] text-slate-500 font-normal">512-byte max</span>
                </div>
              </div>

              {/* Exact Amount */}
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px]">Exact Amount (ZEC)</label>
                <div className="p-2.5 rounded-xl bg-cloak-950 border border-white/10 text-slate-200 text-xs font-bold">
                  {amountZEC} ZEC
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Compatible Wallets */}
          {tab === 'wallets' && (
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-cloak-950 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Zashi (Electric Coin Co.)</h4>
                  <p className="text-[11px] text-slate-400">Official iOS & Android shielded wallet with ZIP-321 support.</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                  Recommended
                </span>
              </div>

              <div className="p-3 rounded-xl bg-cloak-950 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">YWallet</h4>
                  <p className="text-[11px] text-slate-400">High-performance desktop & mobile wallet with ultra-fast sync.</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[10px] font-mono">
                  Desktop & Mobile
                </span>
              </div>

              <div className="p-3 rounded-xl bg-cloak-950 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Zingo! & Nighthawk</h4>
                  <p className="text-[11px] text-slate-400">Full Orchard support, auto-shielding, and instant QR camera recognition.</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[10px] font-mono">
                  Supported
                </span>
              </div>
            </div>
          )}

          {/* Live Status Tracker & Countdown */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            {/* Status indicator */}
            <div className="flex items-center gap-2">
              {paymentStatus === 'waiting' && (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    Waiting for shielded mempool broadcast...
                  </span>
                </>
              )}

              {paymentStatus === 'broadcasting' && (
                <>
                  <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-amber-400 font-mono text-[11px] font-semibold">
                    Shielded transaction broadcast detected...
                  </span>
                </>
              )}

              {paymentStatus === 'verifying' && (
                <>
                  <Radio className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span className="text-emerald-300 font-mono text-[11px] font-semibold">
                    Decrypting memo with IVK (Halo 2 Proofs)...
                  </span>
                </>
              )}

              {paymentStatus === 'confirmed' && (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 font-mono text-[11px] font-semibold">
                    Payment Verified! Unlocking Stream...
                  </span>
                </>
              )}
            </div>

            {/* Countdown timer */}
            <div className="flex items-center gap-1.5 font-mono text-slate-400 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Expires in {formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Testing / Simulator Action Button */}
          <div className="pt-2">
            <button
              onClick={handleSimulatePayment}
              disabled={paymentStatus !== 'waiting'}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-xs tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-cloak-950 shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50"
            >
              {paymentStatus === 'waiting' && (
                <>
                  <Zap className="w-4 h-4 fill-cloak-950" />
                  <span>Simulate Payment Success (Demo Fast-Unlock)</span>
                </>
              )}

              {paymentStatus === 'broadcasting' && (
                <span>Broadcasting to Zcash Orchard Mempool...</span>
              )}

              {paymentStatus === 'verifying' && (
                <span>Validating Shielded Halo 2 ZK Proof...</span>
              )}

              {paymentStatus === 'confirmed' && (
                <span>Success! Decrypting Session Note...</span>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-500 mt-2 font-mono">
              In production, CloakPay listens to the local <code className="text-slate-400">zcashd</code> node via gRPC/lightwalletd.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
