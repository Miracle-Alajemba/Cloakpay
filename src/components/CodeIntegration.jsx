import React, { useState } from 'react';
import { Terminal, Copy, Check, Code2, Server, Shield } from 'lucide-react';

const CODE_EXAMPLES = {
  express: {
    language: 'javascript',
    filename: 'server.js',
    code: `import express from 'express';
import { cloakpay } from '@cloakpay/sdk';

const app = express();

// Protect uncensored AI endpoints with 0.005 ZEC micropayments
app.post('/api/v1/ai/inference', 
  cloakpay({
    amount: '0.005', // ZEC
    recipient: process.env.ZCASH_UNIFIED_ADDRESS,
    fvk: process.env.ZCASH_VIEWING_KEY, // To decrypt session memos
    memoPrefix: 'CloakPay:',
    timeoutSeconds: 300
  }),
  async (req, res) => {
    // If request passes here, payment was cryptographically verified in mempool!
    const stream = await aiModel.generateStream({ prompt: req.body.prompt });
    res.setHeader('Content-Type', 'text/event-stream');
    stream.pipe(res);
  }
);

app.listen(3000);`
  },
  nextjs: {
    language: 'typescript',
    filename: 'app/api/premium/route.ts',
    code: `import { NextRequest } from 'next/server';
import { withCloakPay } from '@cloakpay/nextjs';

export const POST = withCloakPay({
  amountZEC: '0.0025',
  zcashAddress: process.env.ZCASH_UNIFIED_ADDRESS!,
  handler: async (req: NextRequest, session) => {
    // session.sessionId contains the validated encrypted memo hash
    const confidentialData = await fetchInternalIntelligence();
    return Response.json({
      status: 'success',
      sessionHash: session.sessionHash,
      data: confidentialData
    });
  }
});`
  },
  python: {
    language: 'python',
    filename: 'main.py',
    code: `from fastapi import FastAPI, Depends
from cloakpay import CloakPayGuard, ShieldedSession

app = FastAPI()

guard = CloakPayGuard(
    amount_zec="0.005",
    unified_address="u1m6f94r727t...",
    viewing_key=os.environ["ZCASH_INCOMING_VIEWING_KEY"]
)

@app.post("/v1/legal/synthesize")
async def synthesize_contract(
    prompt: str, 
    session: ShieldedSession = Depends(guard)
):
    # Verified by Halo 2 proof inside local zcashd mempool
    return {"result": await llm.complete(prompt), "token": session.id}`
  }
};

export default function CodeIntegration() {
  const [activeTab, setActiveTab] = useState('express');
  const [copied, setCopied] = useState(false);

  const currentCode = CODE_EXAMPLES[activeTab];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="developers" className="py-24 relative bg-cloak-900/30 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium mb-3">
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>DEVELOPER SDK & MIDDLEWARE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            Integrate in 3 Lines of Code
          </h2>
          <p className="mt-3 text-slate-300 text-sm sm:text-base">
            Drop CloakPay into any Node.js, Next.js, or Python FastAPI backend.
            Automate HTTP 402 challenge negotiation and zero-knowledge mempool validation effortlessly.
          </p>
        </div>

        {/* Code Showcase Terminal Window */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-cloak-950 border border-emerald-500/20 shadow-2xl overflow-hidden">
          
          {/* Terminal Tabs & Header */}
          <div className="px-5 py-3.5 bg-cloak-900/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
            
            {/* Left language tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('express')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  activeTab === 'express'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Node.js / Express
              </button>

              <button
                onClick={() => setActiveTab('nextjs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  activeTab === 'nextjs'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Next.js (App Router)
              </button>

              <button
                onClick={() => setActiveTab('python')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  activeTab === 'python'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
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
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5"
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

          {/* Quick CLI install instruction banner */}
          <div className="px-6 py-3.5 bg-cloak-900/60 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">$</span>
              <span>npm install @cloakpay/sdk</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Zero external cloud dependencies
              </span>
              <span>•</span>
              <span className="text-slate-400">Pure Local Viewing Key (FVK/IVK)</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

