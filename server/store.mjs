import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { getPreset } from './presets.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Store {
  constructor() {
    this.sessions = new Map();
    this.consumedTxids = new Map();
    this.load();
  }

  load() {
    if (fs.existsSync(STORE_PATH)) {
      try {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        const data = JSON.parse(raw);
        if (data.sessions) {
          for (const [id, s] of Object.entries(data.sessions)) {
            this.sessions.set(id, s);
          }
        }
        if (data.consumedTxids) {
          for (const [txid, c] of Object.entries(data.consumedTxids)) {
            this.consumedTxids.set(txid, c);
          }
        }
      } catch (err) {
        console.error('[Store] Error reading store.json, initializing fresh store:', err.message);
      }
    }
  }

  save() {
    const data = {
      updatedAt: new Date().toISOString(),
      sessions: Object.fromEntries(this.sessions),
      consumedTxids: Object.fromEntries(this.consumedTxids),
    };
    const tmpPath = `${STORE_PATH}.tmp.${Date.now()}`;
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmpPath, STORE_PATH);
  }

  createSession({ presetId, merchantAddress }) {
    // Look up canonical server-side preset. Client-provided lockedContent is strictly rejected/ignored.
    const preset = getPreset(presetId);

    // Generate at least 128 bits of cryptographic randomness (16 bytes = 128 bits)
    const randomEntropy = crypto.randomBytes(16).toString('hex');
    const sessionId = `sess_${randomEntropy}`;
    const memo = `cp_testnet_${randomEntropy}`;
    const now = Date.now();
    const expiresAt = now + 15 * 60 * 1000; // 15-minute expiry

    const session = {
      id: sessionId,
      sessionId,
      memo,
      amountZatoshis: 100000, // Exactly 100,000 zatoshis (0.001 TAZ)
      amountZEC: '0.001',
      merchantAddress,
      presetId: preset.id,
      lockedContent: preset.lockedText,
      createdAt: now,
      expiresAt,
      consumed: false,
      consumedTxid: null,
      consumedAt: null,
      paymentDetails: null,
    };

    this.sessions.set(sessionId, session);
    this.save();
    return session;
  }

  getSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.load();
    }
    return this.sessions.get(sessionId) || null;
  }

  isTxidConsumed(txid) {
    return this.consumedTxids.has(txid);
  }

  consumeSession(sessionId, txid, paymentDetails) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('SESSION_NOT_FOUND');
    }
    if (session.consumed) {
      // Already consumed for this session
      return session;
    }
    if (Date.now() > session.expiresAt) {
      throw new Error('SESSION_EXPIRED');
    }
    if (this.consumedTxids.has(txid)) {
      const existing = this.consumedTxids.get(txid);
      if (existing.sessionId !== sessionId) {
        throw new Error('TXID_ALREADY_CONSUMED_REPLAY_ATTACK');
      }
    }

    // Atomically mark session and txid as consumed
    session.consumed = true;
    session.consumedTxid = txid;
    session.consumedAt = Date.now();
    session.paymentDetails = paymentDetails;

    this.consumedTxids.set(txid, {
      sessionId,
      consumedAt: Date.now(),
      amountZatoshis: paymentDetails.amountZatoshis,
    });

    this.save();
    return session;
  }
}

export const store = new Store();
