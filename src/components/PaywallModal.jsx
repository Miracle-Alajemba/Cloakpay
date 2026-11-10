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
  Layers,
  Code2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { encodeZip321Memo, buildZip321Uri } from '../utils/zip321';

export default function PaywallModal({ isOpen, onClose, onPaymentSuccess, sessionId, queryPrompt }) {
  const modalBackdropRef = useRef(null);
  const modalBoxRef = useRef(null);

  // Zcash ZIP-321 parameters
  const amountZEC = '0.005';
  const usdValue = '~$0.18';
  const zcashUnifiedAddress = 'u1m6f94r727tt69g2sqg0x7x3a5h4g2k7w90mclp49q8vj9e450nsl8270xvw3v8w6n72u03h8xrqsqq48dyp';
  const memoString = `CloakPay:${sessionId || 'sess_9e14a8f9c'}`;
  
  // Spec-compliant ZIP-321 Base64url memo & URI (RFC 4648 §5 without '=' padding)
  const base64urlMemo = encodeZip321Memo(memoString);
  const zip321Uri = buildZip321Uri({
    address: zcashUnifiedAddress,
    amount: amountZEC,
    memo: memoString
  });

  // State management
  const [copiedField, setCopiedField] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  // Status flow: 'waiting' -> 'detected' -> 'verifying' -> 'granted'
  const [paymentStatus, setPaymentStatus] = useState('waiting');
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
          { opacity: 0, scale: 0.9, y: 25 },
          { 
            opacity: 1, 
            scale: 1, 
            y: 0, 
            duration: 0.45, 
            ease: 'back.out(1.4)',
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
        scale: 0.94,
        y: 15,
        duration: 0.25,
        ease: 'power2.in'
      }, 0)
      .to(modalBackdropRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in'
      }, 0.05);
    } else {
      if (callback) callback();
      else onClose();
    }
  };

  // Simulate Payment broadcast & verification
  const handleSimulatePayment = () => {
    setPaymentStatus('detected');

    setTimeout(() => {
      setPaymentStatus('verifying');

      setTimeout(() => {
        setPaymentStatus('granted');

        // Confetti celebration
        confetti({
          particleCount: 100,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#f4b728', '#ffffff'],
        });

        // Trigger graceful GSAP exit after user sees success confirmation
        setTimeout(() => {
          handleAnimatedClose(() => {
            onPaymentSuccess();
          });
        }, 900);
      }, 1000);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        ref={modalBackdropRef}
        onClick={() => {
          if (paymentStatus !== 'verifying' && paymentStatus !== 'granted') {
            handleAnimatedClose(onClose);
          }
        }}
        className="fixed inset-0 bg-cloak-950/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog Window */}
      <div
        ref={modalBoxRef}
        className="relative w-full max-w-lg rounded-2xl bg-cloak-900 border border-white/10 shadow-2xl overflow-hidden z-10"
      >
        {/* Simulation Banner Notice */}
        <div className="px-4 py-1.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-[11px] font-mono text-amber-300">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Simulation — no real payment is made
          </span>
          <span className="text-amber-400/80">Demo Environment</span>
        </div>

        {/* Modal Top Header */}
        <div className="relative px-6 py-4 border-b border-white/10 flex items-center justify-between bg-cloak-850/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white font-display">
                  Zcash Shielded Payment Request
                </h3>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Session token: <span className="text-emerald-400">{sessionId || 'sess_9e14a8f9c'}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => handleAnimatedClose(onClose)}
            disabled={paymentStatus === 'verifying' || paymentStatus === 'granted'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            aria-label="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">

          {/* Amount and pricing summary */}
          <div className="p-4 rounded-xl bg-cloak-850 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-mono uppercase tracking-wider block">
                Required Micropayment
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-semibold text-white font-mono">
                  {amountZEC} <span className="text-emerald-400">ZEC</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({usdValue})
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-mono">
                Pool / Encoding
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full mt-1">
                <Shield className="w-3 h-3 text-emerald-400" />
                Orchard (ZIP-321 Base64url)
              </span>
            </div>
          </div>

          {/* Navigation sub-tabs */}
          <div className="flex rounded-xl bg-cloak-950 p-1 border border-white/5 text-xs font-medium">
            <button
              onClick={() => setTab('qr')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                tab === 'qr'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              ZIP-321 QR Code
            </button>
            <button
              onClick={() => setTab('manual')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                tab === 'manual'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Address & Base64url Memo
            </button>
            <button
              onClick={() => setTab('wallets')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                tab === 'wallets'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
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
              <div className="relative p-4 rounded-xl bg-white shadow-lg">
                <QRCodeSVG
                  value={zip321Uri}
                  size={180}
                  level="M"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#06080d"
                />

                {/* Center Zcash icon overlay badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-9 h-9 rounded-full bg-slate-950 border-2 border-emerald-400 flex items-center justify-center shadow">
                    <span className="font-bold text-emerald-400 font-mono text-sm leading-none">
                      Z
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-slate-300 font-medium">
                  Scan with any ZIP-321 compatible Zcash wallet (Zashi, YWallet, Zingo!)
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pre-fills address, 0.005 ZEC, and Base64url-encoded session memo
                </p>
              </div>

              {/* Quick Copy ZIP-321 URI button */}
              <button
                onClick={() => copyToClipboard(zip321Uri, 'uri')}
                className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2 font-mono cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              >
                {copiedField === 'uri' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied ZIP-321 URI</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy ZIP-321 URI (zcash:u1...?memo=...)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: Manual Copy Fields & Spec Compliance */}
          {tab === 'manual' && (
            <div className="space-y-3 font-mono text-xs">
              {/* Address field */}
              <div className="space-y-1">
                <div className="text-slate-400 text-[11px] flex items-center justify-between">
                  <span>Zcash Unified Address (Recipient)</span>
                  <button
                    onClick={() => copyToClipboard(zcashUnifiedAddress, 'address')}
                    className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {copiedField === 'address' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedField === 'address' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2.5 rounded-lg bg-cloak-950 border border-white/10 text-slate-300 text-[11px] break-all leading-relaxed select-all">
                  {zcashUnifiedAddress}
                </div>
              </div>

              {/* Base64url Encoded Memo (ZIP-321 parameter) */}
              <div className="space-y-1">
                <div className="text-slate-400 text-[11px] flex items-center justify-between">
                  <span className="text-emerald-300">
                    ZIP-321 Base64url Memo Parameter (<code className="text-slate-400">memo=</code>)
                  </span>
                  <button
                    onClick={() => copyToClipboard(base64urlMemo, 'base64')}
                    className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {copiedField === 'base64' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedField === 'base64' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-cloak-950 border border-emerald-500/25 text-emerald-400 font-mono text-[11px] break-all select-all">
                  {base64urlMemo}
                </div>
              </div>

              {/* Decoded Plaintext Memo */}
              <div className="space-y-1">
                <div className="text-slate-400 text-[11px] flex items-center justify-between">
                  <span>Decoded UTF-8 Memo String (Payload)</span>
                  <button
                    onClick={() => copyToClipboard(memoString, 'memo')}
                    className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {copiedField === 'memo' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedField === 'memo' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2 rounded-lg bg-cloak-950 border border-white/10 text-slate-300 text-xs">
                  {memoString}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Compatible Wallets */}
          {tab === 'wallets' && (
            <div className="space-y-2.5 text-xs font-sans">
              <div className="p-3 rounded-xl bg-cloak-950 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Zashi</h4>
                  <p className="text-xs text-slate-400">Official Electric Coin Co. shielded wallet with ZIP-321 QR parsing.</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-mono">
                  Recommended
                </span>
              </div>

              <div className="p-3 rounded-xl bg-cloak-950 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">YWallet</h4>
                  <p className="text-xs text-slate-400">Desktop & mobile wallet supporting fast sync and shielded memo notes.</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[10px] font-mono">
                  Desktop / Mobile
                </span>
              </div>

              <div className="p-3 rounded-xl bg-cloak-950 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">Zingo! & Nighthawk</h4>
                  <p className="text-xs text-slate-400">Mobile wallets supporting Unified Addresses and Orchard receiver pools.</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[10px] font-mono">
                  Mobile
                </span>
              </div>
            </div>
          )}

          {/* Live Status Tracker: Payment requested -> Waiting for payment -> Payment detected -> Access granted */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {paymentStatus === 'waiting' && (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    Status: <strong>Waiting for payment</strong>
                  </span>
                </>
              )}

              {paymentStatus === 'detected' && (
                <>
                  <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="text-amber-300 font-mono text-[11px] font-medium">
                    Status: <strong>Payment detected</strong> (scanning IVK...)
                  </span>
                </>
              )}

              {paymentStatus === 'verifying' && (
                <>
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  <span className="text-emerald-300 font-mono text-[11px] font-medium">
                    Status: <strong>Verifying session memo...</strong>
                  </span>
                </>
              )}

              {paymentStatus === 'granted' && (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-mono text-[11px] font-medium">
                    Status: <strong>Access granted</strong> (Unlocking stream)
                  </span>
                </>
              )}
            </div>

            {/* Countdown timer */}
            <div className="flex items-center gap-1.5 font-mono text-slate-400 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Expires: {formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Testing / Simulator Action Button - Honestly Labeled */}
          <div className="pt-1">
            <button
              onClick={handleSimulatePayment}
              disabled={paymentStatus !== 'waiting'}
              className="w-full py-3.5 px-4 rounded-xl font-medium text-xs tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-cloak-950 shadow-emerald-500/20 active:scale-[0.99] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            >
              {paymentStatus === 'waiting' && (
                <>
                  <Zap className="w-4 h-4 fill-cloak-950" />
                  <span>Simulate Payment Success (Demo — no real payment is made)</span>
                </>
              )}

              {paymentStatus === 'detected' && (
                <span>Simulating payment detection...</span>
              )}

              {paymentStatus === 'verifying' && (
                <span>Simulating IVK memo verification...</span>
              )}

              {paymentStatus === 'granted' && (
                <span>Access Granted</span>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-400 mt-2 font-mono">
              In production, an Incoming Viewing Key (IVK) scans the provider's node for matching notes.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
