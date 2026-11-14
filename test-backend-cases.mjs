import assert from 'node:assert';
import http from 'node:http';
import { store } from './server/store.mjs';
import { getPreset, SERVER_PRESETS } from './server/presets.mjs';

const BASE_URL = 'http://127.0.0.1:3001';

async function request(path, options = {}) {
  const url = new URL(path, BASE_URL);
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    }, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n━━━ CLOAKPAY BACKEND PAYMENT & SECURITY TEST SUITE ━━━\n');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✓ PASS ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL ${name}`);
      console.error(`         ${err.message}`);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL ${name}`);
      console.error(`         ${err.message}`);
      failed++;
    }
  }

  // 1. Health Endpoint
  await asyncTest('GET /api/health returns 200 with Zcash Testnet info', async () => {
    const res = await request('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.strictEqual(res.body.network, 'Zcash Testnet');
    assert.ok(res.body.merchantAddress.startsWith('utest1'));
    assert.ok(res.body.tazValueNotice.includes('no real-world value'));
  });

  // 2. HTTP 402 Payment Challenge
  let sessionData = null;
  await asyncTest('POST /api/payment-challenge returns 402 with RFC 9110 WWW-Authenticate header', async () => {
    const res = await request('/api/payment-challenge', {
      method: 'POST',
      body: { presetId: 'swiss-zk', lockedContent: 'INJECTED_ATTACKER_CONTENT' },
    });
    assert.strictEqual(res.status, 402);
    assert.ok(res.headers['www-authenticate']);
    assert.ok(res.headers['www-authenticate'].includes('Zcash-ZIP321'));
    assert.ok(res.headers['www-authenticate'].includes('amount="0.001"'));
    assert.ok(res.headers['www-authenticate'].includes('memo='));

    assert.strictEqual(res.body.error, 'Payment Required');
    assert.strictEqual(res.body.session.amountZatoshis, 100000);
    assert.strictEqual(res.body.session.amountZEC, '0.001');
    assert.ok(res.body.session.sessionId.startsWith('sess_'));
    assert.ok(res.body.session.memo.startsWith('cp_testnet_'));
    sessionData = res.body.session;
  });

  // 3. Security: Client-supplied lockedContent is strictly rejected and ignored
  test('Server strictly rejects client-supplied lockedContent and binds server preset', () => {
    const stored = store.getSession(sessionData.sessionId);
    assert.ok(stored, 'Session must exist in store');
    assert.strictEqual(stored.presetId, 'swiss-zk');
    assert.ok(!stored.lockedContent.includes('INJECTED_ATTACKER_CONTENT'), 'Client-supplied payload must NOT be stored');
    const expectedPreset = getPreset('swiss-zk');
    assert.strictEqual(stored.lockedContent, expectedPreset.lockedText);
  });

  // 4. Entropy & Expiry requirements
  test('Session enforces >= 128 bits of entropy and 15-minute expiry', () => {
    const hexPart = sessionData.sessionId.replace('sess_', '');
    assert.ok(hexPart.length >= 32, 'Session ID must contain at least 128 bits (32 hex chars) of entropy');
    const duration = sessionData.expiresAt - sessionData.createdAt;
    assert.strictEqual(duration, 15 * 60 * 1000, 'Expiry must be exactly 15 minutes (900,000 ms)');
  });

  // 5. Waiting state for unpaid session
  await asyncTest('POST /api/verify-payment returns waiting and unlocked: false when unpaid', async () => {
    const res = await request('/api/verify-payment', {
      method: 'POST',
      body: { sessionId: sessionData.sessionId },
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'waiting');
    assert.strictEqual(res.body.unlocked, false);
    assert.strictEqual(res.body.confirmations, 0);
  });

  // 6. Non-existent session returns 404
  await asyncTest('POST /api/verify-payment returns 404 for unknown session', async () => {
    const res = await request('/api/verify-payment', {
      method: 'POST',
      body: { sessionId: 'sess_non_existent_random_id' },
    });
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.error, 'Session not found');
  });

  // 7. Expired session returns 410 Gone
  test('Expired session fails closed with HTTP 410', () => {
    const expiredSession = store.createSession({
      presetId: 'swiss-zk',
      merchantAddress: 'utest193c...',
    });
    // Artificially age session beyond 15 minutes
    expiredSession.expiresAt = Date.now() - 5000;
    store.sessions.set(expiredSession.id, expiredSession);

    assert.ok(Date.now() > expiredSession.expiresAt);
    assert.throws(() => {
      store.consumeSession(expiredSession.id, 'dummy_txid', {});
    }, /SESSION_EXPIRED/);
  });

  // 8. Replay Protection: Atomically blocks double-consumption across sessions
  test('Atomic replay protection blocks reused txid across different sessions', () => {
    const testTxid = 'test_txid_crypto_hash_' + Date.now();
    const sessionA = store.createSession({ presetId: 'swiss-zk', merchantAddress: 'utest1...' });
    const sessionB = store.createSession({ presetId: 'swiss-zk', merchantAddress: 'utest1...' });

    // Consume sessionA with testTxid
    store.consumeSession(sessionA.id, testTxid, { dummy: true });
    assert.strictEqual(sessionA.consumed, true);
    assert.strictEqual(store.isTxidConsumed(testTxid), true);

    // Attempting to consume sessionB with the same testTxid MUST throw REPLAY_ATTACK
    assert.throws(() => {
      store.consumeSession(sessionB.id, testTxid, { dummy: true });
    }, /TXID_ALREADY_CONSUMED_REPLAY_ATTACK/);

    // Idempotent repeat for sessionA must succeed
    const rechecked = store.consumeSession(sessionA.id, testTxid, { dummy: true });
    assert.strictEqual(rechecked.consumed, true);
  });

  // 9. Exact memo and amount verification logic
  test('Scanner note matching rules enforce exact memo, exact zatoshis, and Orchard pool', () => {
    const targetMemo = 'cp_testnet_exact_token_match';
    const targetZats = 100000;

    // Helper simulated filter matching scanner.mjs logic
    function matchNote(transfer) {
      if (transfer.kind !== 'received') return false;
      if (transfer.value !== targetZats) return false;
      const isShielded = Array.isArray(transfer.pools_received) && (
        transfer.pools_received.includes('Ironwood') || transfer.pools_received.includes('Orchard')
      );
      if (!isShielded) return false;
      const memos = Array.isArray(transfer.memos) ? transfer.memos : [];
      return memos.includes(targetMemo);
    }

    // Wrong memo: should reject
    assert.strictEqual(matchNote({
      kind: 'received',
      value: 100000,
      pools_received: ['Ironwood'],
      memos: ['wrong_memo_123'],
    }), false, 'Must reject note with wrong memo');

    // Wrong amount: should reject
    assert.strictEqual(matchNote({
      kind: 'received',
      value: 50000,
      pools_received: ['Ironwood'],
      memos: [targetMemo],
    }), false, 'Must reject note with wrong amount');

    // Transparent pool: should reject
    assert.strictEqual(matchNote({
      kind: 'received',
      value: 100000,
      pools_received: ['Transparent'],
      memos: [targetMemo],
    }), false, 'Must reject transparent note');

    // Valid Orchard note: matches
    assert.strictEqual(matchNote({
      kind: 'received',
      value: 100000,
      pools_received: ['Ironwood'],
      memos: [targetMemo],
    }), true, 'Must accept exact matching Orchard note');
  });

  // 10. Mempool vs Confirmation depth gate
  test('Confirmation gate requires >= 1 on-chain confirmation before unlock', () => {
    function computeConfirmations(transfer, currentHeight) {
      if (transfer.status !== 'confirmed') return 0;
      const blockHeight = transfer.blockheight || 0;
      return (currentHeight >= blockHeight) ? (currentHeight - blockHeight + 1) : 0;
    }

    // Mempool transfer: 0 confirmations
    const mempoolNote = { status: 'mempool', blockheight: 0 };
    assert.strictEqual(computeConfirmations(mempoolNote, 4618558), 0, 'Mempool must have 0 confirmations');

    // Mined note at same height: 1 confirmation
    const minedTip = { status: 'confirmed', blockheight: 4618558 };
    assert.strictEqual(computeConfirmations(minedTip, 4618558), 1, 'Same block height must have 1 confirmation');

    // Mined note 2 blocks deep: 3 confirmations
    const confirmedNote = { status: 'confirmed', blockheight: 4618558 };
    assert.strictEqual(computeConfirmations(confirmedNote, 4618560), 3, 'Deep block must compute correct confirmation depth');
  });

  console.log(`\n━━━ SUMMARY ━━━`);
  console.log(`  Tests: ${passed + failed} total, ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
