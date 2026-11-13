import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  Bot, 
  Send, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Terminal, 
  Copy, 
  Check, 
  Code2, 
  RotateCcw,
  KeyRound,
  EyeOff,
  Radio,
  FastForward,
  Search,
  AlertCircle
} from 'lucide-react';
import { encodeZip321Memo, buildZip321Uri } from '../utils/zip321';

const PRESET_PROMPTS = [
  {
    id: 'swiss-zk',
    title: 'Swiss ZK Patent Clause',
    category: 'Legal / IP',
    query: 'Draft a zero-knowledge cryptographic circuit patent assignment clause under Swiss private international law with no US nexus.',
    previewText: `CONFIDENTIAL MEMORANDUM & ARBITRATION SPECIFICATION
Jurisdiction: Canton of Zurich / Swiss Chambers' Arbitration Institution (SCAI)
Subject: Assignment of Zero-Knowledge Arithmetic Circuit Intellectual Property & Prover Infrastructure

1. DEFINITION OF SHIELDED IP ASSETS:
The Assignor irrevocably conveys to Assignee all global proprietary interests, copyrightable cryptographic compositions, Constraint Systems (R1CS, Plonkish Arithmetization), and Halo 2 recursive polynomial verifier implementations. 

2. EXCLUSION OF EXTRATERRITORIAL DISCLOSURE:
Neither party shall be compelled to deposit proving keys or viewing keys into any foreign escrow or regulatory clearinghouse, in accordance with Article 271 of the Swiss Criminal Code...`,
    lockedText: `3. MEMO-BASED ATTESTATION & ROYALTIES:
Royalty distributions shall execute unconditionally via HTTP 402 endpoints utilizing Zcash Unified Addresses (ZIP-316). Every transfer shall commit a cryptographic proof hash to the 512-byte shielded memo field, establishing non-repudiation without identifying the transacting legal entities.

4. DISPUTE RESOLUTION & CHOICE OF VENUE:
Any controversy, claim, or breach arising from this Circuit Assignment shall be settled exclusively by arbitration administered by the Swiss Arbitration Centre under the Swiss Rules of International Arbitration, seated in Zurich, Switzerland. The proceedings shall be conducted in English, with evidentiary zero-knowledge proofs submitted as self-authenticating cryptographic exhibits.

5. NON-DISCLOSURE OF VIEWING KEYS:
Full incoming viewing keys (IVK) remain solely within the hardware enclave of the Sovereign Trust. No third-party auditor may subpoena secret viewing keys without formal letters rogatory conforming to the Hague Evidence Convention.`
  },
  {
    id: 'smart-contract-audit',
    title: 'AI Payment Agent Audit',
    category: 'Cybersecurity',
    query: 'Adversarial audit of an autonomous AI payment agent for transaction memo replay and timing correlation attacks.',
    previewText: `OFFENSIVE SECURITY REPORT: SEC-ZEC-402-AI
Target: Autonomous HTTP 402 Micropayment Daemon v2.4
Vector: Side-Channel Timing & Memo Replay Vulnerability Analysis

EXECUTIVE SUMMARY:
We performed black-box adversarial modeling against the daemon's ephemeral session matching engine. The engine binds HTTP 402 challenge tokens with 512-byte encrypted Orchard memo notes.

FINDING 1 [INFORMATIONAL - MITIGATED]: 
Timing analysis on mempool decrypt operations confirmed constant-time decryption loops using libpasta and sapling-crypto primitives. No cryptographic leakage observed during trial decryption...`,
    lockedText: `FINDING 2 [CRITICAL HARDENING REQUIREMENT]:
Mempool Replay Attack Surface: If an attacker intercepts the plaintext session token via unencrypted HTTP/1.1 transport, they could broadcast a malformed transaction citing the victim's session hash. 
REMEDIATION: Enforce end-to-end TLS 1.3 with Certificate Transparency and embed an ephemeral Ed25519 client public key in the HTTP Authorization challenge header.

FINDING 3 [PRIVACY CORRELATION RISK]:
Transaction output amounts must adhere strictly to quantized buckets (e.g., exactly 0.005 ZEC or 0.01 ZEC) to thwart blockchain clustering heuristics that monitor anomalous fractionals.`
  },
  {
    id: 'decentralized-media',
    title: 'Micro-Royalty Stream',
    category: 'Decentralized API',
    query: 'Structured cross-border micro-royalty agreement for decentralized media streaming with shielded micropayments.',
    previewText: `STREAMING ARCHITECTURE SPECIFICATION: RFC-MEDIA-SHIELD
Protocol: HTTP 402 Pay-Per-Chunk (Byte-Range 206 Protected Gateways)
Asset: Master Audio Archive [Lossless 24-bit 96kHz FLAC]

OVERVIEW:
Media chunks are partitioned into 1.5MB segmented payloads. The client player requests /media/chunk_0042.bin. The reverse-proxy returns status code 402 with X-Zcash-Payment-Uri headers.

AUTHENTICATION PIPELINE:
Client wallet signs an Orchard shielded output of 0.001 ZEC with memo 'CHUNK:42:EXP_1731234900'. Media gateway verifies the note in mempool and issues an HTTP 206 Partial Content response...`,
    lockedText: `STREAM BUFFERING LOGIC:
The client media player maintains a lookahead buffer of 3 prepaid chunks. When network latency drops below 200ms, pipelined ZIP-321 micro-transactions guarantee gapless playback without stalling audio streams.

AUDIT & TAX EXEMPTION RATIONALE:
Because micro-payments settle directly to creator shielded pools, zero intermediary financial processors hold user custody, eliminating credit card chargeback reserves and merchant processing fees.`
  }
];

export default function AiDemoTerminal({ onTriggerPaywall, isUnlocked, unlockedSessionId }) {
  const [selectedPrompt, setSelectedPrompt] = useState(PRESET_PROMPTS[0]);
  const [inputQuery, setInputQuery] = useState(PRESET_PROMPTS[0].query);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasTriggeredPaywall, setHasTriggeredPaywall] = useState(false);
  
  // View Modes: 'assistant' | 'memo-inspector' | 'inspector'
  const [viewMode, setViewMode] = useState('assistant');
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [copiedHex, setCopiedHex] = useState(false);
  const [copiedZipUri, setCopiedZipUri] = useState(false);

  // Typewriter streaming state for confidential unlocked text
  const [displayedWordsCount, setDisplayedWordsCount] = useState(0);
  const [isStreamingText, setIsStreamingText] = useState(false);

  const terminalRef = useRef(null);
  const paywallCardRef = useRef(null);
  const successBannerRef = useRef(null);
  const streamingContainerRef = useRef(null);

  const lockedWords = selectedPrompt.lockedText.split(' ');

  // GSAP animation with useGSAP and ScrollTrigger
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        terminalRef.current,
        { opacity: 0, y: 25 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.7, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: terminalRef.current,
            start: 'top 85%',
            once: true
          }
        }
      );
    });
  }, { scope: terminalRef });

  // When unlock state transitions to true:
  useEffect(() => {
    if (isUnlocked) {
      if (paywallCardRef.current) {
        gsap.to(paywallCardRef.current, {
          opacity: 0,
          scale: 0.96,
          height: 0,
          paddingTop: 0,
          paddingBottom: 0,
          marginTop: 0,
          marginBottom: 0,
          duration: 0.4,
          ease: 'power2.inOut',
          onComplete: () => {
            setHasTriggeredPaywall(false);
          }
        });
      }

      if (successBannerRef.current) {
        gsap.fromTo(
          successBannerRef.current,
          { opacity: 0, y: -10, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.3)', delay: 0.1 }
        );
      }

      setDisplayedWordsCount(0);
      setIsStreamingText(true);
    } else {
      setDisplayedWordsCount(0);
      setIsStreamingText(false);
    }
  }, [isUnlocked, selectedPrompt]);

  // Typewriter streaming interval
  useEffect(() => {
    if (!isUnlocked || !isStreamingText) return;

    if (displayedWordsCount < lockedWords.length) {
      const timeout = setTimeout(() => {
        setDisplayedWordsCount((prev) => Math.min(prev + 1, lockedWords.length));
      }, 28);
      return () => clearTimeout(timeout);
    } else {
      setIsStreamingText(false);
    }
  }, [isUnlocked, isStreamingText, displayedWordsCount, lockedWords.length]);

  const handleSelectPreset = (preset) => {
    setSelectedPrompt(preset);
    setInputQuery(preset.query);
    if (isUnlocked) {
      setDisplayedWordsCount(0);
      setIsStreamingText(true);
    }
  };

  const handleRunQuery = (e) => {
    e?.preventDefault();
    if (!inputQuery.trim()) return;

    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      if (!isUnlocked) {
        setHasTriggeredPaywall(true);
      } else {
        setDisplayedWordsCount(0);
        setIsStreamingText(true);
      }
    }, 600);
  };

  const handleResetDemo = () => {
    window.location.reload();
  };

  const handleFastForwardStream = () => {
    setDisplayedWordsCount(lockedWords.length);
    setIsStreamingText(false);
  };

  const copyFullResponse = () => {
    const fullText = `${selectedPrompt.previewText}\n\n${selectedPrompt.lockedText}`;
    navigator.clipboard.writeText(fullText);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  // ZIP-321 Spec details
  const effectiveSessionId = unlockedSessionId || 'sess_9e14a8f9c';
  const plaintextMemo = `CloakPay:${effectiveSessionId}|amt=0.005|nonce=0x7b84f3e2|scope=api:inference`;
  const base64urlMemo = encodeZip321Memo(plaintextMemo);
  const sampleRecipientAddress = 'u1m6f94r727tt69g2sqg0x7x3a5h4g2k7w90mclp49q8vj9e450nsl8270xvw3v8w6n72u03h8xrqsqq48dyp';
  const fullZip321Uri = buildZip321Uri({
    address: sampleRecipientAddress,
    amount: '0.005',
    memo: plaintextMemo
  });

  const simulatedHexCiphertext = `0xf4b72805966910b98134d399${effectiveSessionId.split('').map(c => c.charCodeAt(0).toString(16)).join('')}0000000000000000000000000000000000000000000000000000000000000000` +
    `c4e79b12a830df93847291a84f30193850284710293847192837491827364819` +
    `8374918273648192837491827364819283749182736481928374918273648192` +
    `[512 BYTES CHACHA20-POLY1305 ENCRYPTED CIPHERTEXT (ORCHARD SHIELDED NOTE)]`;

  // Status mapping: 'Payment requested' -> 'Waiting for payment' -> 'Payment detected' -> 'Access granted'
  const currentDemoStatus = isUnlocked 
    ? (isStreamingText ? 'Payment detected — Streaming response' : 'Access granted')
    : 'Payment requested';

  return (
    <section id="demo" className="py-16 md:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-3">
            <Terminal className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-[-0.025em] font-display">
            Test a paid API request in real time
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed font-sans max-w-2xl mx-auto">
            Experience how CloakPay gates an API endpoint with an HTTP 402 challenge, generates a spec-compliant ZIP-321 payment request, and unlocks the response upon verification.
          </p>
        </div>

        {/* Preset Query Badges */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-slate-400 font-sans mr-1">
            Sample requests:
          </span>
          {PRESET_PROMPTS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                selectedPrompt.id === preset.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-cloak-900/80 text-slate-300 hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-black/40 text-slate-400">
                {preset.category}
              </span>
              <span>{preset.title}</span>
            </button>
          ))}
        </div>

        {/* The Main Terminal Interface Container */}
        <div
          ref={terminalRef}
          className="rounded-lg bg-cloak-900 border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Top Bar of the Terminal */}
          <div className="px-5 py-3.5 bg-cloak-850/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
            
            {/* Left title & status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <div className="h-4 w-px bg-white/10 ml-1" />
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-white text-sm font-sans">
                  Demo API Endpoint
                </span>
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  • POST /v1/legal/synthesize
                </span>
              </div>
            </div>

            {/* Right mode tabs & Simulation Badge */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Simulation Notice Badge */}
              <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px] font-mono">
                Simulation — no real payment is made
              </span>
              <span className="hidden xl:inline text-amber-400/80 text-[10px] font-mono">
                PRIVATE ZCASH REGTEST — NO REAL-VALUE ZEC
              </span>

              {/* Tab Switcher */}
              <div className="flex rounded-md bg-cloak-950 p-0.5 border border-white/10 text-xs overflow-x-auto max-w-full scrollbar-none">
                <button
                  onClick={() => setViewMode('assistant')}
                  className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                    viewMode === 'assistant'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  Request & Output
                </button>

                <button
                  onClick={() => setViewMode('memo-inspector')}
                  className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                    viewMode === 'memo-inspector'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Decoded Memo</span>
                  <span className="text-[9px] font-mono bg-emerald-500/25 text-emerald-300 px-1 py-0.2 rounded font-medium">
                    Judges
                  </span>
                </button>

                <button
                  onClick={() => setViewMode('inspector')}
                  className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                    viewMode === 'inspector'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  HTTP 402 Inspector
                </button>
              </div>

              {/* Obvious State Badge: Payment requested -> Waiting for payment -> Payment detected -> Access granted */}
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border">
                {isUnlocked ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <Unlock className="w-3 h-3" />
                    {currentDemoStatus}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-400 border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    Status: {currentDemoStatus}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Success Banner when Unlocked */}
          {isUnlocked && (
            <div 
              ref={successBannerRef}
              className="px-6 py-3.5 bg-emerald-950/40 border-b border-emerald-500/25 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-semibold text-emerald-300 font-sans">
                      Payment Verified (Simulation) — Access Granted
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                      Simulated IVK Match
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans flex items-center gap-2 mt-0.5">
                    <span>Session: <code className="text-emerald-300 font-mono font-medium">{effectiveSessionId}</code></span>
                    <span>•</span>
                    <span>Proposed IVK memo decryption</span>
                  </div>
                </div>
              </div>

              {/* Action button to jump to memo inspector */}
              <button
                onClick={() => setViewMode('memo-inspector')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              >
                <Search className="w-3.5 h-3.5" />
                Inspect Decoded 512-Byte Memo
              </button>
            </div>
          )}

          {/* Terminal Body Content */}
          <div className="p-6">
            
            {/* VIEW MODE 1: ASSISTANT CHAT / API DEMO */}
            {viewMode === 'assistant' && (
              <div className="space-y-6">
                
                {/* User Prompt Bubble */}
                <div className="flex items-start gap-3 max-w-3xl">
                  <div className="w-8 h-8 rounded-md bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-300">REQ</span>
                  </div>
                  <div className="p-4 rounded-md bg-cloak-850/90 border border-white/10 text-slate-200 text-sm leading-relaxed font-sans">
                    {inputQuery}
                  </div>
                </div>

                {/* AI Response Bubble */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>

                  <div className="flex-1 overflow-hidden space-y-4">
                    
                    {/* Unlocked Preview Section (Visible to everyone) */}
                    <div className="p-5 rounded-md bg-cloak-950/80 border border-white/5 font-mono text-xs sm:text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap select-text">
                      {selectedPrompt.previewText}
                    </div>

                    {/* Paywall Interception Barrier or Unlocked Full Stream */}
                    {!isUnlocked ? (
                      <div
                        ref={paywallCardRef}
                        className="rounded-lg bg-cloak-950 border border-white/10 overflow-hidden"
                      >
                        {/* Wire Header: Stripe-style HTTP 402 Status Bar */}
                        <div className="px-4 py-2 bg-cloak-900/90 border-b border-white/10 flex items-center justify-between text-[11px] font-mono">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-400" />
                            <span className="text-red-400 font-semibold">HTTP/1.1 402 Payment Required</span>
                            <span className="text-slate-500 hidden sm:inline">•</span>
                            <span className="text-slate-400 hidden sm:inline">application/problem+json</span>
                          </div>
                          <span className="text-amber-400 text-[10px] uppercase tracking-wider font-semibold">Challenge Active</span>
                        </div>

                        {/* Interactive Paywall Trigger Card */}
                        <div className="p-6 sm:p-7 relative z-10 max-w-lg mx-auto flex flex-col items-center text-center">
                          <div className="w-9 h-9 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 mb-3">
                            <Lock className="w-4.5 h-4.5" />
                          </div>

                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-500/10 border border-red-500/25 text-red-400 text-[11px] font-mono font-semibold mb-2">
                            <span>HTTP 402 PAYMENT REQUIRED</span>
                          </div>

                          <h3 className="text-lg font-semibold text-white tracking-[-0.025em] font-display">
                            Pay per request with shielded Zcash
                          </h3>

                          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                            This API endpoint requires a micropayment of 0.005 ZEC (~$0.18). Pay from any Zcash wallet using a ZIP-321 payment request.
                          </p>

                          <div className="mt-4 p-3 rounded-md bg-cloak-900 border border-white/10 w-full flex items-center justify-between text-xs font-mono">
                            <div className="text-left">
                              <span className="text-[10px] text-slate-400 uppercase block">Required Amount</span>
                              <span className="font-semibold text-emerald-400 text-sm tabular-nums">0.005 ZEC</span>
                              <span className="text-slate-400 text-[11px] ml-1 tabular-nums">(~$0.18)</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 uppercase block">Encoding</span>
                              <span className="text-slate-300 text-xs">ZIP-321 Base64url Memo</span>
                            </div>
                          </div>

                          <button
                            onClick={() => onTriggerPaywall(selectedPrompt.query)}
                            className="mt-5 w-full py-2.5 px-5 rounded-md font-medium text-xs sm:text-sm text-cloak-950 bg-emerald-400 hover:bg-emerald-300 transition-colors shadow-sm active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                          >
                            <Unlock className="w-4 h-4" />
                            <span>Unlock with Shielded Zcash (0.005 ZEC)</span>
                          </button>

                          <p className="mt-3 text-[11px] text-slate-400 font-sans">
                            Simulation mode: you can test the instant unlock without sending real ZEC.
                          </p>
                        </div>

                      </div>
                    ) : (
                      /* Unlocked Document Section (Typewriter word-by-word streaming) */
                      <div 
                        ref={streamingContainerRef}
                        className="p-5 rounded-lg bg-cloak-950 border border-emerald-500/25 font-mono text-xs sm:text-[13px] text-slate-200 leading-relaxed select-text relative"
                      >
                        {/* Header badge inside unlocked text */}
                        <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-emerald-500/20 text-[11px] text-emerald-400 gap-2">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Unlock className="w-3.5 h-3.5" />
                            <span>API RESPONSE STREAM UNLOCKED</span>
                            <span className="text-slate-400 font-normal">
                              (Token: {effectiveSessionId})
                            </span>
                          </span>

                          <div className="flex items-center gap-2">
                            {isStreamingText ? (
                              <button
                                onClick={handleFastForwardStream}
                                className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 flex items-center gap-1 text-[10px] cursor-pointer"
                                title="Skip typewriter effect"
                              >
                                <FastForward className="w-3 h-3" />
                                Instant Reveal
                              </button>
                            ) : null}

                            <button
                              onClick={copyFullResponse}
                              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
                            >
                              {copiedResponse ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              {copiedResponse ? 'Copied' : 'Copy output'}
                            </button>
                          </div>
                        </div>

                        {/* Word-by-word Typewriter Text Output */}
                        <div className="whitespace-pre-wrap leading-relaxed text-slate-200">
                          {lockedWords.slice(0, displayedWordsCount).join(' ')}
                          {isStreamingText && (
                            <span className="inline-block w-1.5 h-4 bg-emerald-400 ml-1 animate-pulse align-middle" />
                          )}
                        </div>

                        {/* Stream status footer */}
                        <div className="mt-4 pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2 font-sans">
                          <div className="flex items-center gap-2">
                            {isStreamingText ? (
                              <span className="flex items-center gap-1 text-amber-300 font-mono">
                                <Radio className="w-3 h-3 animate-pulse" />
                                Streaming response payload...
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-mono">
                                ✓ Stream Complete • Simulated IVK note detection
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[11px]">HTTP 200 OK</span>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

              </div>
            )}

            {/* VIEW MODE 2: DECODED 512-BYTE MEMO INSPECTOR FOR JUDGES */}
            {viewMode === 'memo-inspector' && (
              <div className="space-y-6 font-mono text-xs">
                
                {/* Intro notice for judges */}
                <div className="p-4 rounded-xl bg-cloak-850 border border-white/10 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white font-display flex items-center gap-2">
                      <span>ZIP-321 Base64url Memo & Incoming Viewing Key (IVK) Verification</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                        Spec Compliant
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                      Under ZIP-321, payment request URIs require the <code className="text-emerald-300">memo=</code> parameter to be Base64url-encoded without padding. 
                      The API provider uses an <strong>Incoming Viewing Key (IVK)</strong>—the least-privileged viewing key—to detect the transaction and decrypt the memo without holding any spending authority.
                    </p>
                  </div>
                </div>

                {/* Grid comparing Public Ledger vs Decrypted Gateway State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Left: What Public Blockchain Observers See */}
                  <div className="p-4 rounded-xl bg-cloak-950 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                        <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                        1. Public Blockchain Observers See
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Orchard Shielded</span>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">Sender Address:</span>
                        <span className="text-emerald-400 font-medium">Concealed (Orchard pool)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">Recipient Address:</span>
                        <span className="text-emerald-400 font-medium">Concealed (Note commitment)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">Transaction Value:</span>
                        <span className="text-emerald-400 font-medium">Concealed (Pedersen commitment)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">Payload Encryption:</span>
                        <span className="text-slate-300">ChaCha20-Poly1305 (512-byte memo)</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>ZIP-321 Base64url Memo Parameter:</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(base64urlMemo);
                            setCopiedZipUri(true);
                            setTimeout(() => setCopiedZipUri(false), 2000);
                          }}
                          className="text-emerald-400 hover:underline cursor-pointer flex items-center gap-1 text-[10px]"
                        >
                          {copiedZipUri ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedZipUri ? 'Copied' : 'Copy Base64url'}
                        </button>
                      </div>
                      <div className="p-2 rounded bg-cloak-900 border border-white/5 text-[10px] text-emerald-300 font-mono break-all select-all">
                        {base64urlMemo}
                      </div>
                    </div>
                  </div>

                  {/* Right: What CloakPay Node Decrypts via IVK */}
                  <div className="p-4 rounded-xl bg-cloak-950 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                      <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        2. API Provider Decrypts via IVK
                      </span>
                      <span className="text-[10px] text-emerald-300 font-mono">Least-Privilege</span>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">Key Type:</span>
                        <span className="text-emerald-300 font-mono">Incoming Viewing Key (IVK)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">Spending Authority:</span>
                        <span className="text-slate-300">None (Cannot spend funds)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">Extracted Session Token:</span>
                        <span className="text-emerald-400 font-medium">{effectiveSessionId}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">Authentication Result:</span>
                        <span className="text-emerald-400 font-medium">Binds to HTTP 402 challenge</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>Decoded Plaintext UTF-8 Memo:</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(plaintextMemo);
                            setCopiedMemo(true);
                            setTimeout(() => setCopiedMemo(false), 2000);
                          }}
                          className="text-emerald-400 hover:underline cursor-pointer flex items-center gap-1 text-[10px]"
                        >
                          {copiedMemo ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedMemo ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="p-2 rounded bg-cloak-900 border border-emerald-500/30 text-[11px] text-emerald-300 font-medium break-all select-all">
                        {plaintextMemo}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Important Technical & Privacy Clarification */}
                <div className="p-3.5 rounded-xl bg-cloak-900 border border-white/10 text-xs text-slate-300 font-sans flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Technical Clarification for Auditors:</strong> Shielded Zcash can hide transaction details from public blockchain observers when shielded transactions are used. It does not make API use anonymous: the API provider can see the request it receives and may receive the caller’s IP address and connection metadata. CloakPay’s current demo simulates payment verification; it does not send real ZEC.
                  </p>
                </div>

                {/* Structured Payload Breakdown Table */}
                <div className="p-4 rounded-xl bg-cloak-950 border border-white/10 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-sans">
                    Structured 512-Byte Memo Schema (RFC-CLOAKPAY-01)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-400 text-[11px]">
                          <th className="py-2 px-3">Field</th>
                          <th className="py-2 px-3">Value</th>
                          <th className="py-2 px-3">Purpose</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        <tr>
                          <td className="py-2 px-3 text-emerald-400 font-medium">Protocol Prefix</td>
                          <td className="py-2 px-3 text-slate-300">CloakPay:</td>
                          <td className="py-2 px-3 text-slate-400">Namespace filter for the provider's IVK scanner</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-emerald-400 font-medium">Session Token</td>
                          <td className="py-2 px-3 text-white font-medium">{effectiveSessionId}</td>
                          <td className="py-2 px-3 text-slate-400">Binds transaction to client's specific HTTP request</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-emerald-400 font-medium">Amount</td>
                          <td className="py-2 px-3 text-slate-300 tabular-nums">0.005 ZEC</td>
                          <td className="py-2 px-3 text-slate-400">Expected payment amount per request</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-emerald-400 font-medium">Nonce</td>
                          <td className="py-2 px-3 text-slate-300">0x7b84f3e2</td>
                          <td className="py-2 px-3 text-slate-400">Anti-replay defense against memo reuse</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-emerald-400 font-medium">Scope</td>
                          <td className="py-2 px-3 text-slate-300">api:inference</td>
                          <td className="py-2 px-3 text-slate-400">Requested API service access scope</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* VIEW MODE 3: HTTP 402 WIRE INSPECTOR */}
            {viewMode === 'inspector' && (
              <div className="p-4 rounded-xl bg-cloak-950 border border-white/10 font-mono text-xs space-y-4">
                <div>
                  <div className="text-slate-400 text-[11px] font-medium mb-1 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    1. Client Initial Request:
                  </div>
                  <pre className="p-3 rounded-lg bg-cloak-900 border border-white/5 text-slate-300 overflow-x-auto">
{`POST /v1/legal/synthesize HTTP/1.1
Host: api.provider.com
Content-Type: application/json
Accept: text/event-stream

{
  "prompt": "${inputQuery.substring(0, 45)}..."
}`}
                  </pre>
                </div>

                <div>
                  <div className="text-amber-300 text-[11px] font-medium mb-1 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    2. Server Returns HTTP 402 Payment Required:
                  </div>
                  <pre className="p-3 rounded-lg bg-cloak-900 border border-amber-500/20 text-amber-200/90 overflow-x-auto text-[11px]">
{`HTTP/1.1 402 Payment Required
Content-Type: application/problem+json
WWW-Authenticate: CloakPay realm="session_${effectiveSessionId}",
  zcash_uri="zcash:${sampleRecipientAddress}?amount=0.005&memo=${base64urlMemo}",
  memo_base64url="${base64urlMemo}",
  expiry="300"
X-CloakPay-Status: PaymentRequested
Retry-After: 3`}
                  </pre>
                </div>

                {isUnlocked && (
                  <div>
                    <div className="text-emerald-400 text-[11px] font-medium mb-1 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      3. Server Detects Memo via IVK & Returns 200 OK:
                    </div>
                    <pre className="p-3 rounded-lg bg-cloak-900 border border-emerald-500/30 text-emerald-300 overflow-x-auto text-[11px]">
{`HTTP/1.1 200 OK
Content-Type: text/event-stream
X-CloakPay-Settlement: ShieldedNoteDetected (IVK Match)
X-CloakPay-Memo: CloakPay:${effectiveSessionId}
Cache-Control: no-cache, no-store`}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Input Form at Bottom */}
            <form onSubmit={handleRunQuery} className="mt-6 pt-5 border-t border-white/10 flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Enter a prompt to test the paid API flow..."
                  className="w-full pl-4 pr-12 py-2.5 rounded-md bg-cloak-950 border border-white/10 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-white placeholder-slate-500 font-sans outline-none transition-all focus-visible:ring-2 focus-visible:ring-emerald-400"
                />
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors cursor-pointer disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                  aria-label="Submit Question"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {isUnlocked && (
                <button
                  type="button"
                  onClick={handleResetDemo}
                  title="Reset demo session"
                  className="p-2.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </form>

          </div>

        </div>

      </div>
    </section>
  );
}
