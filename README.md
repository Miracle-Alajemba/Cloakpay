# CloakPay 🛡️⚡

**The HTTP 402 Micropayment Protocol for AI & Media powered by Zcash Encrypted Memos.**

> Accountless. Zero wallet-connect tracking. Zero metadata leaks. Sub-second mempool verification.

---

## ⚡ What is CloakPay?

RFC 9110 reserves HTTP 402 (‘Payment Required’) for future use; it does not define a payment protocol. CloakPay uses 402 as its application-level payment challenge and supplies payment instructions using a ZIP-321 URI with shielded Zcash (Orchard / Halo 2). 

Unlike Ethereum, Solana, or Bitcoin Lightning:
- **Zero Public Ledger Clustering**: Senders use Orchard shielded pools, concealing sender addresses, balances, and transaction graphs.
- **Encrypted Session Memos**: The 512-byte Zcash shielded memo field embeds an ephemeral cryptographic session token (`CloakPay:sess_<hash>`).
- **Sub-Second Mempool Verification**: The server's incoming viewing key (IVK) decrypts matching unconfirmed notes directly in the mempool (~800ms) to stream paywalled AI responses without waiting for block confirmations.
- **Zero Account Registration**: No emails, no phone numbers, no tracking cookies, and no Web3 wallet-connect telemetry (e.g. Infura / Alchemy IP logging).

---

## 🚀 Tech Stack

- **React 19**: Functional components, custom hooks, and modular architecture.
- **Tailwind CSS**: Dark-mode fintech styling with deep slate/obsidian palette (`#06080d`) and glowing Zcash emerald accents (`#10b981`).
- **GSAP (GreenSock Animation Platform)**: Entrance timelines, floating UI cards, and spring-like modal transitions.
- **Lucide React**: Clean minimalist cyber-security and fintech icons.
- **qrcode.react**: High-precision SVG generation for ZIP-321 Zcash payment URIs.
- **canvas-confetti**: Celebration explosion upon zero-knowledge mempool payment verification.

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` (or the port specified by Vite).

### 3. Production Build
```bash
npm run build
```

---

## 🔬 Protocol Flow (RFC 9110 + ZIP-321)

```
[ Client / AI User ]                 [ CloakPay Gateway ]                 [ Zcash Shielded Mempool ]
        |                                     |                                        |
        |--- 1. POST /api/inference --------->|                                        |
        |<-- 2. HTTP 402 Payment Required ----|                                        |
        |   (ZIP-321 URI + Session Token)     |                                        |
        |                                     |                                        |
        |--- 3. Broadcast Shielded Note ---------------------------------------------->|
        |      (Memo: CloakPay:sess_0x8f2)    |                                        |
        |                                     |<-- 4. IVK decrypts memo (~800ms) ------|
        |                                     |                                        |
        |<-- 5. HTTP 200 Stream Granted ------|                                        |
```

---

## 👨‍⚖️ Judge Features & Live Demo Controls

1. **Instant Paywall Simulation**:
   - Hit "Try Interactive AI Paywall" or send an uncensored inquiry in the AI terminal to trigger the HTTP 402 barrier.
2. **GSAP Spring & Fade Transitions**:
   - Paywall modal scales in with a spring bounce (`ease: 'back.out(1.5)'`) and exits with a smooth GSAP fade-out upon payment confirmation.
3. **Verified Session Active Banner**:
   - When simulated payment broadcasts, the AI Terminal displays the verified Orchard Shielded Note session with sub-second mempool attestation (Halo 2).
4. **Live Word-by-Word Typewriter Streaming**:
   - The previously blurred confidential output streams in real-time with an animated terminal cursor, replicating real LLM inference stream unlock.
5. **Decoded 512-Byte Memo Inspector**:
   - Inspect the raw 512-byte ChaCha20-Poly1305 ciphertext versus the decrypted plaintext token (`CloakPay:sess_<id>|amt=0.005|nonce=0x7b84f3e2`).
   - Verifies that zero sender identity or wallet addresses are leaked.

---

## 📜 Standards & Compliance
- **HTTP 402**: RFC 9110 Section 15.5.3 (RFC 9110 reserves the status code for future use; CloakPay defines the application-level challenge protocol)
- **ZIP-321**: Zcash Payment Request URIs
- **ZIP-316**: Unified Addresses & Orchard Receiver Pools
- **Halo 2**: Recursive Zero-Knowledge SNARKs without trusted setup

