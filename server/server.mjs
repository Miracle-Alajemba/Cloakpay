import http from 'node:http';
import { store } from './store.mjs';
import { scanForPayment, getScannerStatus, queryMerchantWallet } from './scanner.mjs';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '127.0.0.1';
const MERCHANT_ADDRESS = process.env.MERCHANT_ADDRESS || 'utest193cduapq3ggad4fxvzuqsy35nlx74j25dv0ru2mmfnvdfa95hmxggahrgln5p4092289n7rzvy6wapm5fqpw2ymj4k2eaxktyudr5wt8';
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_ORIGIN,
].filter(Boolean);

/**
 * Base64url encoding conforming to RFC 4648 §5 without '=' padding (ZIP-321 specification).
 */
function encodeZip321Memo(memoText) {
  return Buffer.from(memoText, 'utf-8')
    .toString('base64url')
    .replace(/=+$/, '');
}

/**
 * Builds standard ZIP-321 URI.
 */
function buildZip321Uri({ address, amount, memo }) {
  const base64urlMemo = encodeZip321Memo(memo);
  return `zcash:${address}?amount=${amount}&memo=${base64urlMemo}`;
}

function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Direct or server-to-server request
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function sendJson(res, statusCode, data, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    ...headers,
  });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) { // 1MB limit
        req.destroy();
        reject(new Error('Request entity too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(req, res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Health check & Scanner Readiness
  if (req.method === 'GET' && pathname === '/api/health') {
    return sendJson(res, 200, {
      status: 'ok',
      network: 'Zcash Testnet',
      merchantAddress: MERCHANT_ADDRESS,
      tazValueNotice: 'TAZ has no real-world value',
      scanner: getScannerStatus(),
    });
  }

  // Dedicated scanner readiness endpoint
  if (req.method === 'GET' && pathname === '/api/scanner-status') {
    return sendJson(res, 200, {
      status: 'ok',
      scanner: getScannerStatus(),
    });
  }

  // 1. Issue HTTP 402 Payment Challenge
  if (req.method === 'POST' && pathname === '/api/payment-challenge') {
    try {
      const body = await readBody(req);
      const presetId = body.presetId || 'swiss-zk';
      const existingSessionId = body.sessionId;

      // Reuse existing valid session if requested, otherwise create fresh session with 128-bit entropy
      let session = (existingSessionId && store.getSession(existingSessionId))
        ? store.getSession(existingSessionId)
        : store.createSession({
            presetId,
            merchantAddress: MERCHANT_ADDRESS,
          });

      const base64urlMemo = encodeZip321Memo(session.memo);
      const zip321Uri = buildZip321Uri({
        address: session.merchantAddress,
        amount: session.amountZEC,
        memo: session.memo,
      });

      // HTTP 402 Payment Required
      const challengeHeader = `Zcash-ZIP321 address="${session.merchantAddress}", amount="${session.amountZEC}", memo="${base64urlMemo}"`;

      return sendJson(res, 402, {
        error: 'Payment Required',
        status: 402,
        network: 'Zcash Testnet',
        notice: 'TAZ has no real-world value. Payment required to unlock requested API payload.',
        session: {
          sessionId: session.id,
          memo: session.memo,
          base64urlMemo,
          amountZEC: session.amountZEC,
          amountZatoshis: session.amountZatoshis,
          merchantAddress: session.merchantAddress,
          zip321Uri,
          expiresAt: session.expiresAt,
          createdAt: session.createdAt,
        },
      }, {
        'WWW-Authenticate': challengeHeader,
      });
    } catch (err) {
      return sendJson(res, 500, { error: err.message });
    }
  }

  // 2. Verify Payment against Merchant Watch-Only Scanner
  if (req.method === 'POST' && pathname === '/api/verify-payment') {
    try {
      const body = await readBody(req);
      const { sessionId } = body;

      if (!sessionId) {
        return sendJson(res, 400, { error: 'Missing sessionId parameter' });
      }

      const session = store.getSession(sessionId);
      if (!session) {
        return sendJson(res, 404, { error: 'Session not found' });
      }

      // Check expiry
      if (Date.now() > session.expiresAt) {
        return sendJson(res, 410, {
          error: 'Session expired',
          expired: true,
          sessionId,
        });
      }

      // Idempotency: If already consumed, return cached unlock result
      if (session.consumed) {
        return sendJson(res, 200, {
          status: 'confirmed',
          unlocked: true,
          payment: session.paymentDetails,
          data: {
            presetId: session.presetId,
            lockedContent: session.lockedContent,
          },
        });
      }

      // Scan merchant watch-only wallet with fail-closed safety
      let payment = null;
      try {
        payment = await scanForPayment({
          expectedMemo: session.memo,
          expectedZatoshis: session.amountZatoshis,
        });
      } catch (scanErr) {
        console.warn(`[Scanner Status] Scan in progress/pending: ${scanErr.message}`);
        return sendJson(res, 200, {
          status: 'waiting',
          unlocked: false,
          confirmations: 0,
          scannerReady: false,
          message: 'Scanner synchronizing with Zcash Testnet node...',
        });
      }

      if (!payment) {
        return sendJson(res, 200, {
          status: 'waiting',
          unlocked: false,
          confirmations: 0,
          scannerReady: true,
          message: 'No incoming payment detected for this session memo yet.',
        });
      }

      // Check mempool status
      if (payment.status === 'mempool') {
        return sendJson(res, 200, {
          status: 'mempool',
          unlocked: false,
          confirmations: 0,
          txid: payment.txid,
          message: 'Payment detected in Testnet mempool. Awaiting 1 on-chain block confirmation before unlock.',
        });
      }

      // Check confirmed status with at least 1 confirmation
      if (payment.status === 'confirmed') {
        if (payment.confirmations < 1) {
          return sendJson(res, 200, {
            status: 'mining',
            unlocked: false,
            confirmations: 0,
            txid: payment.txid,
            message: 'Transaction included in block, waiting for confirmation depth...',
          });
        }

        // Replay Protection: Atomically verify and consume session
        try {
          store.consumeSession(sessionId, payment.txid, payment);
        } catch (consumeErr) {
          if (consumeErr.message === 'TXID_ALREADY_CONSUMED_REPLAY_ATTACK') {
            return sendJson(res, 409, {
              error: 'Transaction replay detected. This transaction ID has already unlocked another session.',
            });
          }
          throw consumeErr;
        }

        // Return HTTP 200 with unlocked payload!
        return sendJson(res, 200, {
          status: 'confirmed',
          unlocked: true,
          payment: {
            txid: payment.txid,
            amountZatoshis: payment.amountZatoshis,
            amountZEC: session.amountZEC,
            pool: payment.pool,
            confirmations: payment.confirmations,
            blockHeight: payment.blockHeight,
            memo: payment.memo,
            memoMatched: true,
          },
          data: {
            presetId: session.presetId,
            lockedContent: session.lockedContent,
          },
        });
      }

      return sendJson(res, 200, {
        status: 'unknown',
        unlocked: false,
      });
    } catch (err) {
      console.error('[VerifyPayment Error]:', err);
      return sendJson(res, 500, { error: 'Internal scanner verification error', details: err.message });
    }
  }

  // Not found
  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`[CloakPay Server] Running on http://${HOST}:${PORT}`);
  console.log(`[CloakPay Server] Configured Merchant Orchard Address: ${MERCHANT_ADDRESS}`);
  // Initial background scanner warm-up
  queryMerchantWallet().then((res) => {
    console.log(`[CloakPay Server] Watch-only scanner ready. Chain height: ${res.currentHeight}, confirmed transfers: ${res.valueTransfers.length}`);
  }).catch((err) => {
    console.warn(`[CloakPay Server] Initial scanner warm-up note: ${err.message}`);
  });
});
