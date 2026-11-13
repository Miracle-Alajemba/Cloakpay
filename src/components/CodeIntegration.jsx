import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Copy, Check, Code2, Shield } from 'lucide-react';

const CODE_EXAMPLES = {
  express: {
    language: 'javascript',
    filename: 'server.js',
    code: `import express from 'express';
import { cloakpay } from '@cloakpay/sdk';

const app = express();

// Protect API endpoints with per-request shielded ZEC payments
app.post('/api/v1/ai/inference', 
  cloakpay({
    amount: '0.005', // ZEC
    recipient: process.env.ZCASH_UNIFIED_ADDRESS,
    // Least-privileged key: IVK can only detect incoming notes, cannot spend funds
    ivk: process.env.ZCASH_INCOMING_VIEWING_KEY,
    memoPrefix: 'CloakPay:',
    timeoutSeconds: 300
  }),
  async (req, res) => {
    // Execution reaches here only after shielded transaction memo is verified
    const stream = await aiModel.generateStream({ prompt: req.body.prompt });
    res.setHeader('Content-Type', 'text/event-stream');
    stream.pipe(res);
  }
);

app.listen(3000);`
  },
  nextjs: {
    language: 'typescript',
    filename: 'app/api/inference/route.ts',
    code: `import { NextRequest } from 'next/server';
import { withCloakPay } from '@cloakpay/nextjs';

export const POST = withCloakPay({
  amountZEC: '0.005',
  zcashAddress: process.env.ZCASH_UNIFIED_ADDRESS!,
  ivk: process.env.ZCASH_INCOMING_VIEWING_KEY!,
  handler: async (req: NextRequest, session) => {
    // session.sessionId holds the authenticated session token from the memo
    const aiOutput = await runInference(await req.json());
    return Response.json({
      status: 'success',
      sessionHash: session.sessionHash,
      data: aiOutput
    });
  }
});`
  },
  python: {
    language: 'python',
    filename: 'main.py',
    code: `from fastapi import FastAPI, Depends
from cloakpay import CloakPayGuard, ShieldedSession
import os

app = FastAPI()

# Deploy only the Incoming Viewing Key (IVK) to the application runtime
guard = CloakPayGuard(
    amount_zec="0.005",
    unified_address=os.environ["ZCASH_UNIFIED_ADDRESS"],
    ivk=os.environ["ZCASH_INCOMING_VIEWING_KEY"]
)

@app.post("/v1/legal/synthesize")
async def synthesize_contract(
    prompt: str, 
    session: ShieldedSession = Depends(guard)
):
    # Verified by IVK memo decryption on provider node
    return {"result": await llm.complete(prompt), "session_id": session.id}`
  }
};

export default function CodeIntegration() {
  const [activeTab, setActiveTab] = useState('express');
  const [copied, setCopied] = useState(false);
  const codeSectionRef = useRef(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        codeSectionRef.current?.querySelector('.code-window'),
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: codeSectionRef.current,
            start: 'top 82%',
            once: true
          }
        }
      );
    });
  }, { scope: codeSectionRef });

  const currentCode = CODE_EXAMPLES[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="developers" ref={codeSectionRef} className="py-20 relative bg-cloak-900/30 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header: Stripe Docs-style left-aligned technical header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/10 text-emerald-400 text-xs font-mono mb-3">
            <Code2 className="w-3.5 h-3.5" />
            <span>03 / DEVELOPER INTEGRATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-[-0.025em] font-display">
            Add per-request payments to your API in minutes
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
            CloakPay middleware intercepts incoming HTTP requests, returns an HTTP 402 challenge with a ZIP-321 payment URI, and unlocks the handler when the incoming transaction is detected.
          </p>
        </div>

        {/* Code Showcase Terminal Window */}
        <div className="code-window max-w-4xl mx-auto rounded-lg bg-cloak-950 border border-white/10 shadow-2xl overflow-hidden">
          
          {/* Terminal Tabs & Header */}
          <div className="px-5 py-3.5 bg-cloak-900/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
            
            {/* Left language tabs */}
            <div role="tablist" aria-label="Code language examples" className="flex items-center gap-2">
              <button
                role="tab"
                aria-selected={activeTab === 'express'}
                onClick={() => setActiveTab('express')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                  activeTab === 'express'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Node.js / Express
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'nextjs'}
                onClick={() => setActiveTab('nextjs')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                  activeTab === 'nextjs'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Next.js Route
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'python'}
                onClick={() => setActiveTab('python')}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                  activeTab === 'python'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Python FastAPI
              </button>
            </div>

            {/* Right: Filename & Copy button */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">
                {currentCode.filename}
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

          </div>

          {/* Terminal Code Body */}
          <div className="p-6 overflow-x-auto font-mono text-xs sm:text-[13px] leading-relaxed text-slate-300 bg-cloak-950">
            <pre className="select-all">
              <code>{currentCode.code}</code>
            </pre>
          </div>

          {/* Security note footer */}
          <div className="px-6 py-3.5 bg-cloak-900/60 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">$</span>
              <span>npm install @cloakpay/sdk</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-sans text-slate-300">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Uses Incoming Viewing Key (IVK) only — no spending keys on server</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
