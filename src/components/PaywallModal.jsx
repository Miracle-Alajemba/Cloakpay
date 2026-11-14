import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Radio,
  Zap,
  AlertCircle,
  QrCode,
  Shield,
  Layers,
  Code2,
  RefreshCw,
  Server
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { encodeZip321Memo, buildZip321Uri } from '../utils/zip321';

export default function PaywallModal({ isOpen, onClose, onPaymentSuccess, sessionId: initialSessionId, queryPrompt }) {
  const modalBackdropRef = useRef(null);
  const modalBoxRef = useRef(null);

  // Active payment mode: 'testnet' (live public Zcash Testnet) or 'simulator' (fallback demo)
  const [paymentMode, setPaymentMode] = useState('testnet');
  const [serverOnline, setServerOnline] = useState(false);
  const [liveSession, setLiveSession] = useState(null);
  const [liveConfirmations, setLiveConfirmations] = useState(0);
  const [liveTxid, setLiveTxid] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Fallback / Simulator parameters (preserves test-e2e assertions)
  const amountZEC = paymentMode === 'testnet' && liveSession ? liveSession.amountZEC : '0.005';
  const usdValue = paymentMode === 'testnet' ? 'Testnet TAZ (no real-world value)' : '~$0.18';
  const zcashUnifiedAddress = paymentMode === 'testnet' && liveSession
    ? liveSession.merchantAddress
    : 'u1m6f94r727tt69g2sqg0x7x3a5h4g2k7w90mclp49q8vj9e450nsl8270xvw3v8w6n72u03h8xrqsqq48dyp';
  const memoString = paymentMode === 'testnet' && liveSession
    ? liveSession.memo
    : `CloakPay:${initialSessionId || 'sess_9e14a8f9c'}`;

  // Spec-compliant ZIP-321 Base64url memo & URI (RFC 4648 §5 without '=' padding)
  const base64urlMemo = encodeZip321Memo(memoString);
  const zip321Uri = buildZip321Uri({
    address: zcashUnifiedAddress,
    amount: amountZEC,
    memo: memoString
  });

  // State management
  const [copiedField, setCopiedField] = useState(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes (900s)
  // Status flow: 'waiting' -> 'detected' -> 'verifying' -> 'granted'
  const [paymentStatus, setPaymentStatus] = useState('waiting');
  const [tab, setTab] = useState('qr'); // 'qr' | 'manual' | 'wallets'

  // Fetch real HTTP 402 Challenge from backend server
  const fetchChallenge = useCallback(async () => {
    try {
      const res = await fetch('/api/payment-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presetId: 'swiss-zk', prompt: queryPrompt, sessionId: initialSessionId }),
      });

      if (!res.ok && res.status !== 402) {
        throw new Error(`Unexpected status ${res.status}`);
      }

      const data = await res.json();
      if (data.session) {
        setLiveSession(data.session);
        setServerOnline(true);
        const remaining = Math.max(0, Math.floor((data.session.expiresAt - Date.now()) / 1000));
        setTimeLeft(remaining || 900);
      }
    } catch (err) {
      setServerOnline(false);
      setTimeLeft(300);
    }
  }, [queryPrompt, initialSessionId]);

  useEffect(() => {
    if (!isOpen) {
      setLiveSession(null);
      setPaymentStatus('waiting');
      setLiveConfirmations(0);
      setLiveTxid(null);
      setStatusMessage('');
      return;
    }

    fetchChallenge();
  }, [isOpen, fetchChallenge]);

  // Live scanner verification polling when paymentMode === 'testnet'
  useEffect(() => {
    if (!isOpen || paymentMode !== 'testnet' || !liveSession) return;
    if (paymentStatus === 'granted') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: liveSession.sessionId }),
        });

        if (!res.ok) return;
        const data = await res.json();

        if (data.status === 'mempool') {
          setPaymentStatus('detected');
          setLiveTxid(data.txid);
          setStatusMessage(data.message || 'Payment detected in Testnet mempool. Awaiting 1 on-chain block confirmation...');
        } else if (data.status === 'mining') {
          setPaymentStatus('verifying');
          setLiveTxid(data.txid);
          setStatusMessage(data.message || 'Transaction included in block, waiting for confirmation depth...');
        } else if (data.status === 'confirmed' && data.unlocked) {
          setPaymentStatus('granted');
          setLiveConfirmations(data.payment.confirmations);
          setLiveTxid(data.payment.txid);
          setStatusMessage(`Payment confirmed! ${data.payment.confirmations} confirmation(s). Decrypted memo verified.`);

          // Confetti celebration
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#10b981', '#34d399', '#059669', '#ffffff'],
          });

          setTimeout(() => {
            handleAnimatedClose(() => {
              if (onPaymentSuccess) {
                onPaymentSuccess(data.payment);
              }
            });
          }, 1500);
        }
      } catch (err) {
        // Scanner poll error (ignore intermittent network drops)
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isOpen, paymentMode, liveSession, paymentStatus]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // GSAP Spring Entrance & Keyboard Navigation
  useEffect(() => {
    if (isOpen) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          modalBackdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: 'power2.out' }
        );
        gsap.fromTo(
          modalBoxRef.current,
          { opacity: 0, scale: 0.94, y: 20 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: 'back.out(1.3)',
            delay: 0.05
          }
        );
      });

      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && paymentStatus !== 'verifying' && paymentStatus !== 'granted') {
          handleAnimatedClose(onClose);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        ctx.revert();
      };
    }
  }, [isOpen, paymentStatus]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(900);
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

  // Simulate Payment broadcast & verification (fallback mode)
  const handleSimulatePayment = () => {
    setPaymentStatus('detected');

    setTimeout(() => {
      setPaymentStatus('verifying');

      setTimeout(() => {
        setPaymentStatus('granted');

        confetti({
          particleCount: 100,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#059669', '#ffffff'],
        });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        ref={modalBackdropRef}
        onClick={() => {
          if (paymentStatus !== 'verifying' && paymentStatus !== 'granted') {
            handleAnimatedClose(onClose);
          }
        }}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Window */}
      <div
        ref={modalBoxRef}
        className="relative w-full max-w-lg rounded-xl bg-white border border-slate-200 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[calc(100dvh-32px)] my-auto"
      >
        {/* Network & Mode Banner Notice */}
        {paymentMode === 'testnet' ? (
          <div className="px-4 py-1.5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-xs font-mono text-emerald-900 shrink-0">
            <span className="flex items-center gap-2 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="tracking-wide">Zcash Testnet</span>
              <span className="text-emerald-300 font-normal">|</span>
              <span className="text-emerald-800 font-normal">TAZ has no real-world value</span>
            </span>
            <span className="text-emerald-800 text-[10px] font-semibold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 font-mono hidden sm:inline-block">
              {serverOnline ? 'LIVE SCANNER CONNECTED · 1 CONFIRM' : 'SCANNER READY'}
            </span>
          </div>
        ) : (
          <div className="px-4 py-1.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs font-mono text-amber-900 shrink-0">
            <span className="flex items-center gap-2 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span className="tracking-wide">Standalone Simulator</span>
              <span className="text-amber-300 font-normal">|</span>
              <span className="text-amber-800 font-normal">Simulation — no real payment is made</span>
            </span>
            <span className="text-amber-800 text-[10px] font-semibold bg-amber-100 px-2 py-0.5 rounded border border-amber-200 font-mono hidden sm:inline-block">
              SANDBOX SIMULATION
            </span>
          </div>
        )}

        {/* Modal Top Header */}
        <div className="relative px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-md bg-emerald-100/80 border border-emerald-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 font-display leading-tight truncate">
                Zcash Shielded Payment Request
              </h3>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                Session Memo: <span className="text-emerald-700 font-medium select-all">{memoString}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => handleAnimatedClose(onClose)}
            disabled={paymentStatus === 'verifying' || paymentStatus === 'granted'}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none shrink-0 ml-2"
            aria-label="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-4 space-y-2.5 overflow-y-auto flex-1">

          {/* Payment Mode Selector */}
          <div className="p-0.5 rounded-lg bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setPaymentMode('testnet');
                if (!liveSession || !serverOnline) fetchChallenge();
              }}
              className={`py-1.5 px-2.5 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer font-medium ${
                paymentMode === 'testnet'
                  ? 'bg-white text-emerald-900 border border-emerald-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border border-transparent'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-semibold text-xs">Live Zcash Testnet</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">0.001 TAZ</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMode('simulator')}
              className={`py-1.5 px-2.5 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer font-medium ${
                paymentMode === 'simulator'
                  ? 'bg-white text-amber-900 border border-amber-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border border-transparent'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span className="font-semibold text-xs">Standalone Simulator</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono">Demo</span>
            </button>
          </div>

          {/* Amount and pricing summary */}
          <div className="px-3 py-2 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider block leading-none">
                {paymentMode === 'testnet' ? 'Testnet Micropayment Amount' : 'Simulated Micropayment Amount'}
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-lg sm:text-xl font-bold text-slate-900 font-mono tabular-nums leading-none">
                  {amountZEC} <span className={paymentMode === 'testnet' ? 'text-emerald-700' : 'text-amber-700'}>{paymentMode === 'testnet' ? 'TAZ' : 'ZEC'}</span>
                </span>
                <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                  {paymentMode === 'testnet' ? '(100,000 zatoshis • No real-world value)' : `(${usdValue} · 500,000 zatoshis)`}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 block font-mono leading-none">
                Pool / Encoding
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded mt-1 font-mono">
                <Shield className="w-3 h-3 text-emerald-600" />
                Orchard (ZIP-321 Base64url)
              </span>
            </div>
          </div>

          {/* Navigation sub-tabs */}
          <div className="flex rounded-md bg-slate-100 p-0.5 border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setTab('qr')}
              className={`flex-1 py-1 px-2 rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                tab === 'qr'
                  ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">ZIP-321 QR Code</span>
              <span className="sm:hidden">QR Code</span>
            </button>
            <button
              onClick={() => setTab('manual')}
              className={`flex-1 py-1 px-2 rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                tab === 'manual'
                  ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Address & Base64url Memo</span>
              <span className="sm:hidden">Parameters</span>
            </button>
            <button
              onClick={() => setTab('wallets')}
              className={`flex-1 py-1 px-2 rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                tab === 'wallets'
                  ? 'bg-white text-slate-900 border border-slate-200 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Wallets</span>
            </button>
          </div>

          {/* TAB 1: QR Code Scanner */}
          {tab === 'qr' && (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="relative p-2 rounded-lg bg-white border border-slate-200 shadow-xs">
                <QRCodeSVG
                  value={zip321Uri}
                  size={136}
                  level="M"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                />

                {/* Center Zcash icon overlay badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-6 h-6 rounded-full bg-white border-2 border-emerald-600 flex items-center justify-center shadow-xs">
                    <span className="font-bold text-emerald-700 font-mono text-xs leading-none">
                      Z
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center max-w-sm">
                <p className="text-xs text-slate-700 font-medium">
                  Scan with a ZIP-321 wallet (Zashi, YWallet, Zingo!)
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Pre-fills address, {amountZEC} {paymentMode === 'testnet' ? 'TAZ' : 'ZEC'}, and Base64url session memo
                </p>
              </div>

              {/* Quick Copy ZIP-321 URI button */}
              <button
                onClick={() => copyToClipboard(zip321Uri, 'uri')}
                className="w-full py-1.5 px-3 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 hover:text-slate-900 transition-colors flex items-center justify-center gap-2 font-mono cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
              >
                {copiedField === 'uri' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied ZIP-321 URI</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy ZIP-321 URI (zcash:u1...?memo=...)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: Manual Copy Fields & Spec Compliance */}
          {tab === 'manual' && (
            <div className="space-y-2 font-mono text-xs">
              {/* Address field */}
              <div className="space-y-0.5">
                <div className="text-slate-500 text-[11px] flex items-center justify-between">
                  <span>Zcash Unified Address (Recipient)</span>
                  <button
                    onClick={() => copyToClipboard(zcashUnifiedAddress, 'address')}
                    className="text-emerald-700 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {copiedField === 'address' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedField === 'address' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2 rounded-md bg-slate-50 border border-slate-200 text-slate-800 text-[11px] break-all leading-relaxed select-all">
                  {zcashUnifiedAddress}
                </div>
              </div>

              {/* Base64url Encoded Memo (ZIP-321 parameter) */}
              <div className="space-y-0.5">
                <div className="text-slate-500 text-[11px] flex items-center justify-between">
                  <span className="text-emerald-800 font-medium">
                    ZIP-321 Base64url Memo Parameter (<code className="text-slate-600">memo=</code>)
                  </span>
                  <button
                    onClick={() => copyToClipboard(base64urlMemo, 'base64')}
                    className="text-emerald-700 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {copiedField === 'base64' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedField === 'base64' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2 rounded-md bg-emerald-50/60 border border-emerald-200 text-emerald-900 font-mono text-[11px] break-all select-all">
                  {base64urlMemo}
                </div>
              </div>

              {/* Decoded Plaintext Memo */}
              <div className="space-y-0.5">
                <div className="text-slate-500 text-[11px] flex items-center justify-between">
                  <span>Decoded Plaintext UTF-8 Memo</span>
                  <button
                    onClick={() => copyToClipboard(memoString, 'memo')}
                    className="text-emerald-700 hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    {copiedField === 'memo' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copiedField === 'memo' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2 rounded-md bg-slate-50 border border-slate-200 text-slate-800 text-xs">
                  {memoString}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Compatible Wallets */}
          {tab === 'wallets' && (
            <div className="space-y-2 text-xs font-sans">
              <div className="p-2 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">Zashi</h4>
                  <p className="text-[11px] text-slate-500">Official Electric Coin Co. shielded wallet with ZIP-321 QR parsing.</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono shrink-0">
                  Recommended
                </span>
              </div>

              <div className="p-2 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">YWallet</h4>
                  <p className="text-[11px] text-slate-500">Desktop & mobile wallet supporting fast sync and shielded memo notes.</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono shrink-0">
                  Desktop / Mobile
                </span>
              </div>

              <div className="p-2 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900">Zingo! & Nighthawk</h4>
                  <p className="text-[11px] text-slate-500">Mobile wallets supporting Unified Addresses and Orchard receiver pools.</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono shrink-0">
                  Mobile
                </span>
              </div>
            </div>
          )}

          {/* Live Status Tracker */}
          <div className="pt-2 border-t border-slate-200 flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {paymentStatus === 'waiting' && (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-slate-700 font-mono text-[11px]">
                      Status: <strong>Waiting for payment</strong>
                    </span>
                  </>
                )}

                {paymentStatus === 'detected' && (
                  <>
                    <Radio className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span className="text-amber-800 font-mono text-[11px] font-medium">
                      Status: <strong>Payment detected</strong> in mempool
                    </span>
                  </>
                )}

                {paymentStatus === 'verifying' && (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                    <span className="text-emerald-800 font-mono text-[11px] font-medium">
                      Status: <strong>Verifying on-chain confirmation...</strong>
                    </span>
                  </>
                )}

                {paymentStatus === 'granted' && (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-mono text-[11px] font-semibold">
                      Status: <strong>Access granted</strong>
                    </span>
                  </>
                )}
              </div>

              {/* Countdown timer */}
              <div className="flex items-center gap-1.5 font-mono text-slate-500 text-[11px] tabular-nums">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Expires: {formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Detailed status note if present */}
            {statusMessage && (
              <p className="text-[10px] text-slate-600 font-mono truncate">
                {statusMessage}
              </p>
            )}

            {liveTxid && (
              <p className="text-[10px] text-slate-600 font-mono truncate">
                TxID: <span className="text-emerald-700 select-all">{liveTxid}</span>
              </p>
            )}
          </div>

          {/* Action Area */}
          <div className="pt-0.5">
            {paymentMode === 'simulator' ? (
              <div>
                <button
                  onClick={handleSimulatePayment}
                  disabled={paymentStatus !== 'waiting'}
                  className="w-full py-2 px-3 rounded-md font-medium text-xs tracking-wide uppercase transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-500 text-white active:scale-[0.99] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
                >
                  {paymentStatus === 'waiting' && (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-white" />
                      <span>Simulate Payment (Demo — no real payment is made)</span>
                    </>
                  )}

                  {paymentStatus === 'detected' && (
                    <span>Payment detected in mempool...</span>
                  )}

                  {paymentStatus === 'verifying' && (
                    <span>Verifying shielded memo note...</span>
                  )}

                  {paymentStatus === 'granted' && (
                    <span>Access granted</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="py-1.5 px-2.5 rounded-md bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Server className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] text-slate-700 truncate">
                    Watch-only scanner active · 1 confirm required
                  </span>
                </div>
                <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0 font-mono">
                  Orchard Shielded
                </span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
