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

function renderHighlightedCode(code) {
  return code.split('\n').map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
      return (
        <div key={idx} className="text-slate-400 italic">
          {line}
        </div>
      );
    }
    const parts = line.split(/('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|process\.env\.[A-Z_!]+|os\.environ\["[A-Z_]+"\]|\b(?:import|export|from|const|async|await|return|def|class|with)\b|ivk:)/g);
    return (
      <div key={idx} className="leading-relaxed">
        {parts.map((part, pIdx) => {
          if (!part) return null;
          if (part === 'ivk:') {
            return <span key={pIdx} className="text-emerald-700 font-bold">{part}</span>;
          }
          if (/^['"]/.test(part)) {
            return <span key={pIdx} className="text-emerald-700">{part}</span>;
          }
          if (/\b(?:import|export|from|const|async|await|return|def|class|with)\b/.test(part)) {
            return <span key={pIdx} className="text-indigo-600 font-semibold">{part}</span>;
          }
          if (/^process\.env|^os\.environ/.test(part)) {
            return <span key={pIdx} className="text-amber-800 font-medium">{part}</span>;
          }
          return <span key={pIdx} className="text-slate-800">{part}</span>;
        })}
      </div>
    );
  });
}

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
    <section id="developers" ref={codeSectionRef} className="py-20 relative bg-[#fafaf9] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono mb-3">
            <Code2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>03 / DEVELOPER INTEGRATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight font-display">
            Add per-request payments to your API in minutes
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed font-sans">
            CloakPay middleware intercepts incoming HTTP requests, returns an HTTP 402 challenge with a ZIP-321 payment URI, and unlocks the handler when the incoming transaction is detected.
          </p>
        </div>

        {/* Code Showcase Terminal Window - Light Visual Theme */}
        <div className="code-window max-w-4xl mx-auto rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Terminal Tabs & Header */}
          <div className="px-5 py-3 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            
            {/* Left language tabs */}
            <div role="tablist" aria-label="Code language examples" className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200/80 text-xs">
              <button
                role="tab"
                aria-selected={activeTab === 'express'}
                onClick={() => setActiveTab('express')}
                className={`px-3 py-1.5 rounded-md font-sans text-xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                  activeTab === 'express'
                    ? 'bg-white text-slate-900 border border-slate-200/80 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 border border-transparent'
                }`}
              >
                Node.js / Express
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'nextjs'}
                onClick={() => setActiveTab('nextjs')}
                className={`px-3 py-1.5 rounded-md font-sans text-xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                  activeTab === 'nextjs'
                    ? 'bg-white text-slate-900 border border-slate-200/80 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 border border-transparent'
                }`}
              >
                Next.js Route
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'python'}
                onClick={() => setActiveTab('python')}
                className={`px-3 py-1.5 rounded-md font-sans text-xs transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                  activeTab === 'python'
                    ? 'bg-white text-slate-900 border border-slate-200/80 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 border border-transparent'
                }`}
              >
                Python FastAPI
              </button>
            </div>

            {/* Right: Filename & Copy button */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                {currentCode.filename}
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-xs flex items-center gap-1.5 shadow-2xs focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span className="font-sans font-medium">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

          </div>

          {/* Terminal Code Body - Light Neutral Surface with Dark Readable Text */}
          <div className="p-6 overflow-x-auto font-mono text-xs sm:text-[13px] leading-relaxed text-slate-800 bg-[#fafaf9] border-b border-slate-200">
            <pre className="select-all">
              <code>{renderHighlightedCode(currentCode.code)}</code>
            </pre>
          </div>

          {/* Security note footer */}
          <div className="px-6 py-3 bg-slate-50 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-600">
            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-2xs">
              <span className="text-emerald-700 font-bold">$</span>
              <span className="text-slate-800">npm install @cloakpay/sdk</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-sans text-slate-600">
              <Shield className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Uses Incoming Viewing Key (IVK) only — no spending keys on server</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
