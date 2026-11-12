# CloakPay 🛡️⚡

**Per-request API monetization powered by shielded Zcash (ZEC).**

> "Pay for one API request—not a subscription."  
> CloakPay helps API providers charge per request in shielded ZEC. A user pays from a Zcash wallet, and access is granted after the payment is verified—without creating a CloakPay account or connecting a persistent Web3 wallet.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cloakpay--zec.vercel.app-10b981?style=for-the-badge&logo=vercel)](https://cloakpay-zec.vercel.app)
[![Zcash](https://img.shields.io/badge/Powered%20By-Zcash%20Orchard-f4b728?style=for-the-badge&logo=zcash)](https://z.cash)
[![Standards](https://img.shields.io/badge/Standards-RFC%209110%20%7C%20ZIP--321-blue?style=for-the-badge)](https://zips.z.cash/zip-0321)

---

## 🌐 Live Application

- **Production Deployment:** [https://cloakpay-zec.vercel.app](https://cloakpay-zec.vercel.app)
- **Repository:** [https://github.com/Miracle-Alajemba/Cloakpay](https://github.com/Miracle-Alajemba/Cloakpay)

> ⚠️ **Simulation Notice:** CloakPay's current public demo simulates the payment challenge, mempool detection, and access unlock flow. It does not send real ZEC, connect to a live wallet, or verify transactions on mainnet. Accountless access and IVK-based verification are proposed architectural designs.

---

## ⚡ Overview & Problem Statement

### The Problem with Traditional API Monetization
* **SaaS Subscription Fatigue:** API providers either enforce $20–$100+/month recurring SaaS tiers or require credit cards with KYC, identity tracking, and billing profiles.
* **Public Blockchain Linkage:** Traditional Web3 payment models (Ethereum, Solana) expose caller wallet addresses, token balances, and entire transaction graphs on public explorers.
* **Browser Wallet Telemetry:** Connecting Web3 browser wallets often leaks RPC endpoint telemetry, client IP addresses (via RPC providers), and cross-site session fingerprints.

### The CloakPay Solution (Proposed Architecture)
CloakPay proposes a protocol allowing API providers to gate individual REST or streaming endpoints behind micropayments denominated in shielded Zcash (ZEC):
* **Accountless & Frictionless (Proposed):** Users do not register, create passwords, or link credit cards.
* **Shielded On-Chain:** Payments use Zcash **Orchard shielded note pools**. Senders, recipients, and transaction amounts are concealed from public blockchain observers when shielded transactions are used.
* **ZIP-321 Encrypted Memos:** An ephemeral cryptographic session token (`CloakPay:sess_<token>`) is embedded in the 512-byte shielded memo field.
* **Least-Privilege Key Architecture (Proposed):** The API server holds only an **Incoming Viewing Key (IVK)** to detect payments and decrypt session memos. No private spending keys are ever stored on the application server.

> **RFC 9110 Compliance Note:**  
> RFC 9110 reserves HTTP 402 (‘Payment Required’) for future use; it does not define a payment protocol. CloakPay uses 402 as its application-level payment challenge and supplies payment instructions using a ZIP-321 URI.

---

## 🔬 Architecture & The 3-Step Flow

```
+---------------------+              +-----------------------+              +------------------------+
| Client / AI User    |              | CloakPay API Gateway  |              | Zcash Shielded Mempool |
+---------------------+              +-----------------------+              +------------------------+
           |                                     |                                       |
           |--- 1. POST /v1/ai/inference ------->|                                       |
           |    (Unauthenticated API request)    |                                       |
           |                                     |                                       |
           |<-- 2. HTTP 402 Payment Required ----|                                       |
           |    - ZIP-321 Payment URI            |                                       |
           |    - Ephemeral session token        |                                       |
           |    - Base64url memo parameter       |                                       |
           |                                     |                                       |
           |--- 3. Broadcast Shielded Note --------------------------------------------->|
           |    (0.005 ZEC with session memo)    |                                       |
           |                                     |<-- 4. Server scans note via IVK ------|
           |                                     |       (Matches session token in memo) |
           |                                     |                                       |
           |<-- 5. HTTP 200 Streaming Stream ----|                                       |
           |    (Full response unlocked)         |                                       |
```

### Step 1: Request a Paid API Resource
The client invokes a protected API route (e.g. `POST /v1/ai/inference`). The provider intercepts the call and responds with an **HTTP 402 Payment Required** challenge containing:
* A Zcash Unified Address (`u1...`)
* The required amount (e.g. `0.005 ZEC`)
* A standard **ZIP-321 URI** with an ephemeral session token encoded in Base64url (`RFC 4648 §5` without `=` padding).

### Step 2: Receive Payment Request & Pay from Wallet
The user opens any ZIP-321 compatible Zcash wallet (e.g. **Zashi**, **YWallet**, **Zingo!**) and scans the QR code or copies the payment parameters. The wallet broadcasts an Orchard shielded note carrying the session memo. On-chain transaction details remain concealed.

### Step 3: IVK Note Detection & Access Unlock
The API provider's background scanner uses an **Incoming Viewing Key (IVK)** to detect matching unspent notes in the mempool or mined blocks. Decrypting the memo matches the client's session token and unlocks the HTTP 200 streaming response.

---

## 🛡️ Technical & Privacy Boundary

Shielded Zcash can hide transaction details from public blockchain observers when shielded transactions are used. It does not make API use anonymous: the API provider can see the request it receives and may receive the caller’s IP address and connection metadata. CloakPay’s current demo simulates payment verification; it does not send real ZEC.

---

## 📊 Implementation Status: What Works Today vs. Roadmap

| Feature | Status | Description |
| :--- | :--- | :--- |
| **Interactive HTTP 402 Simulator** | ✅ Implemented | Live 4-stage cycle: *Payment requested* &rarr; *Waiting for payment* &rarr; *Payment detected* &rarr; *Access granted* with typewriter text streaming and instant reveal. |
| **Spec-Compliant ZIP-321 Builder** | ✅ Implemented | Strict RFC 4648 §5 Base64url encoding without `=` padding; parses and generates standard `zcash:` URIs. |
| **512-Byte Shielded Memo Schema** | ✅ Implemented | Application payload schema: `CloakPay:sess_<id>\|amt=0.005\|nonce=0x...\|scope=api:inference` with roundtrip decoder. |
| **Reference Middleware Code** | ✅ Implemented | Reference implementations for Express/Node.js, Next.js App Router, and Python FastAPI utilizing Incoming Viewing Keys (`ivk`). |
| **Automated E2E Verification Suite** | ✅ Implemented | 27+ automated unit & integration tests (`node test-e2e.mjs`) verifying crypto routines, typography, and UI state integrity. |
| **Live `zebrad` / `zaino` gRPC Daemon** | 🔄 Planned | Background service connecting directly to Zebra/Zaino nodes for real-time unconfirmed mempool note decryption. |
| **Distributed Session Store** | 🔄 Planned | Persistent Redis / PostgreSQL nonce index for replay attack mitigation across clustered API workers. |
| **Multi-Tenant Merchant Dashboard** | 🔄 Planned | Non-custodial portal for API providers to register Unified Addresses and deploy IVKs. |
| **Published SDK Packages** | 🔄 Planned | Packaged `@cloakpay/sdk` on npm and `python-cloakpay` on PyPI. |

---

## 💻 Developer Reference Middleware

CloakPay is designed to integrate into existing API frameworks with minimal code:

### Node.js / Express
```javascript
import express from 'express';
import { cloakpay } from '@cloakpay/sdk';

const app = express();

// Protect API endpoint with per-request shielded ZEC
app.post('/api/v1/ai/inference', 
  cloakpay({
    amount: '0.005', // ZEC
    recipient: process.env.ZCASH_UNIFIED_ADDRESS,
    // Least-privileged key: IVK can only detect notes, cannot spend funds
    ivk: process.env.ZCASH_INCOMING_VIEWING_KEY,
    memoPrefix: 'CloakPay:',
    timeoutSeconds: 300
  }),
  async (req, res) => {
    const stream = await aiModel.generateStream({ prompt: req.body.prompt });
    res.setHeader('Content-Type', 'text/event-stream');
    stream.pipe(res);
  }
);

app.listen(3000);
```

### Python FastAPI
```python
from fastapi import FastAPI, Depends
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
    return {"result": await llm.complete(prompt), "session_id": session.id}
```

---

## 🛠️ Local Quickstart

### Prerequisites
- Node.js 18+ and npm

### 1. Clone & Install
```bash
git clone git@github.com:Miracle-Alajemba/Cloakpay.git
cd Cloakpay
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to interact with the landing page and simulator.

### 3. Run Automated E2E Verification Suite
```bash
node test-e2e.mjs
```
Runs 27+ checks verifying:
- Typography & font loading (`Outfit`, `Inter`, `JetBrains Mono`)
- Exact hero copy and positioning
- RFC 4648 §5 Base64url ZIP-321 memo encoding and round-trip decoding
- Least-privileged key usage (`ivk` exclusively)
- Honest simulation notices and privacy boundaries
- RFC 9110 HTTP 402 accuracy

### 4. Build for Production
```bash
npm run build
```
Generates optimized static production bundle in `dist/`.

---

## 📜 Standards & Specifications
- **HTTP 402**: RFC 9110 Section 15.5.3 (RFC 9110 reserves the status code for future use; CloakPay defines the application-level challenge protocol)
- **ZIP-321**: Zcash Payment Request URIs
- **ZIP-316**: Unified Addresses & Orchard Receiver Pools
- **RFC 4648 §5**: Base64url encoding without padding
- **Least-Privilege Key Architecture**: Incoming Viewing Keys (IVK) only

---

## ⚖️ License
MIT License. Built for the Zcash.
