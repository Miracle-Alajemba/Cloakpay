/**
 * CloakPay Server-Side Protected Response Presets
 *
 * Secure server-side store of protected response payloads.
 * The client CANNOT supply or overwrite protected content in payment challenges.
 * Content is associated with the session strictly by presetId on the backend,
 * and released only after verified on-chain Testnet payment confirmation.
 */

export const SERVER_PRESETS = {
  'swiss-zk': {
    id: 'swiss-zk',
    title: 'Swiss ZK Patent Clause',
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
Full incoming viewing keys (IVK) remain solely within the hardware enclave of the Sovereign Trust. No third-party auditor may subpoena secret viewing keys without formal letters rogatory conforming to the Hague Evidence Convention.`,
  },
  'smart-contract-audit': {
    id: 'smart-contract-audit',
    title: 'AI Payment Agent Audit',
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
Transaction output amounts must adhere strictly to quantized buckets (e.g., exactly 0.005 ZEC or 0.01 ZEC) to thwart blockchain clustering heuristics that monitor anomalous fractionals.`,
  },
  'decentralized-media': {
    id: 'decentralized-media',
    title: 'Micro-Royalty Stream',
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
Because micro-payments settle directly to creator shielded pools, zero intermediary financial processors hold user custody, eliminating credit card chargeback reserves and merchant processing fees.`,
  },
};

export const DEFAULT_PRESET_ID = 'swiss-zk';

export function getPreset(presetId) {
  if (presetId && SERVER_PRESETS[presetId]) {
    return SERVER_PRESETS[presetId];
  }
  return SERVER_PRESETS[DEFAULT_PRESET_ID];
}
