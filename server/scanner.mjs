import { spawn } from 'node:child_process';
import path from 'node:path';

const ZINGO_CLI = process.env.ZINGO_CLI_PATH || '/home/miracle-alajemba/.cargo/bin/zingo-cli';
const MERCHANT_DATA_DIR = process.env.MERCHANT_DATA_DIR || '/home/miracle-alajemba/.cache/cp_merchant_watch';
const ZINGO_SERVER = process.env.ZINGO_SERVER || 'https://testnet.zec.rocks:443';
const IPV4_PRELOAD = process.env.ZINGO_PRELOAD || '/home/miracle-alajemba/.cache/ipv4_only.so';

// In-flight scan promise coalescing and short-lived caching
let inFlightQueryPromise = null;
let lastScanResult = null;
let lastScanTimestamp = 0;
let lastScanError = null;
const CACHE_TTL_MS = 2500; // Reuse scan result if younger than 2.5s to prevent wallet lock contention

/**
 * Returns current sanitized readiness status of the watch-only scanner.
 */
export function getScannerStatus() {
  const now = Date.now();
  const isHealthy = lastScanResult !== null && !lastScanError;
  // If data is older than 30 seconds and no query is in flight, trigger background refresh
  if (isHealthy && (now - lastScanTimestamp) > 30000 && !inFlightQueryPromise) {
    queryMerchantWallet({ force: true }).catch(() => {});
  }
  return {
    ready: isHealthy,
    currentHeight: lastScanResult ? lastScanResult.currentHeight : 0,
    transfersCount: lastScanResult ? lastScanResult.valueTransfers.length : 0,
    lastScanAgeMs: lastScanTimestamp ? now - lastScanTimestamp : null,
    inFlight: inFlightQueryPromise !== null,
    lastError: lastScanError ? lastScanError.message : null,
  };
}

/**
 * Executes an individual zingo-cli scan session with watchdog timeout and clean termination.
 */
function executeScanSession() {
  return new Promise((resolve, reject) => {
    let proc = null;
    let stdout = '';
    let stderr = '';
    let commandsSent = false;
    let isSettled = false;

    const watchdog = setTimeout(() => {
      if (isSettled) return;
      isSettled = true;
      if (proc) {
        try { proc.kill('SIGKILL'); } catch (e) {}
      }
      reject(new Error('Scanner query timed out after 20 seconds'));
    }, 20000);

    try {
      proc = spawn(ZINGO_CLI, [
        '--chain', 'testnet',
        '--server', ZINGO_SERVER,
        '--data-dir', MERCHANT_DATA_DIR,
      ], {
        env: {
          ...process.env,
          LD_PRELOAD: IPV4_PRELOAD,
        },
      });
    } catch (spawnErr) {
      clearTimeout(watchdog);
      return reject(new Error(`Failed to spawn scanner process: ${spawnErr.message}`));
    }

    proc.stdout.on('data', (d) => {
      stdout += d;
      // Send commands once the interactive prompt is ready and background sync has initiated
      if (!commandsSent && stdout.includes('>>')) {
        commandsSent = true;
        setTimeout(() => {
          try {
            proc.stdin.write('messages\nheight\nquit\n');
          } catch (e) {}
        }, 1200);
      }
    });

    proc.stderr.on('data', (d) => {
      stderr += d;
    });

    proc.on('close', (code) => {
      clearTimeout(watchdog);
      if (isSettled) return;
      isSettled = true;

      if (code !== 0 && !stdout.includes('"value_transfers"')) {
        const sanitizedErr = (stderr || stdout).slice(0, 160).replace(/[\r\n]+/g, ' ');
        return reject(new Error(`Scanner exited with code ${code}: ${sanitizedErr}`));
      }

      try {
        // Extract value_transfers JSON block
        const transfersMatch = stdout.match(/\{[\s\S]*\"value_transfers\"[\s\S]*?\n\}/);
        let valueTransfers = [];
        if (transfersMatch) {
          const parsed = JSON.parse(transfersMatch[0]);
          valueTransfers = parsed.value_transfers || [];
        }

        // Extract chain height JSON block
        const heightMatch = stdout.match(/\{\s*\"height\":\s*(\d+)\s*\}/);
        let currentHeight = 0;
        if (heightMatch) {
          currentHeight = parseInt(heightMatch[1], 10);
        }

        resolve({
          valueTransfers,
          currentHeight,
          scannedAt: Date.now(),
        });
      } catch (err) {
        reject(new Error(`Failed to parse scanner output: ${err.message}`));
      }
    });

    proc.on('error', (err) => {
      clearTimeout(watchdog);
      if (isSettled) return;
      isSettled = true;
      reject(new Error(`Scanner process error: ${err.message}`));
    });
  });
}

/**
 * Queries the merchant watch-only wallet on public Zcash Testnet with single-flight deduplication.
 * If a scan is already running, subsequent callers await the same in-flight Promise.
 * If a result was obtained within CACHE_TTL_MS, it is returned immediately without re-spawning.
 */
export async function queryMerchantWallet({ force = false } = {}) {
  const now = Date.now();

  if (!force && lastScanResult && (now - lastScanTimestamp) < CACHE_TTL_MS) {
    return lastScanResult;
  }

  if (inFlightQueryPromise) {
    return inFlightQueryPromise;
  }

  inFlightQueryPromise = executeScanSession()
    .then((result) => {
      lastScanResult = result;
      lastScanTimestamp = Date.now();
      lastScanError = null;
      return result;
    })
    .catch((err) => {
      lastScanError = err;
      throw err;
    })
    .finally(() => {
      inFlightQueryPromise = null;
    });

  return inFlightQueryPromise;
}

/**
 * Explicit check for scanner readiness used by health endpoints and server startup.
 */
export async function checkScannerReadiness() {
  try {
    const res = await queryMerchantWallet({ force: true });
    return {
      ready: true,
      currentHeight: res.currentHeight,
      transfersCount: res.valueTransfers.length,
      lastError: null,
    };
  } catch (err) {
    return {
      ready: false,
      currentHeight: 0,
      transfersCount: 0,
      lastError: err.message,
    };
  }
}

/**
 * Searches the merchant watch-only wallet for a specific payment note.
 * Enforces:
 * - exact amount match (expectedZatoshis)
 * - exact decrypted memo match (expectedMemo)
 * - received in shielded Orchard/Ironwood pool
 * - calculates exact confirmation count from current chain tip
 */
export async function scanForPayment({ expectedMemo, expectedZatoshis }) {
  const { valueTransfers, currentHeight } = await queryMerchantWallet();

  for (const transfer of valueTransfers) {
    if (transfer.kind !== 'received') continue;

    // Verify exact amount
    if (transfer.value !== expectedZatoshis) continue;

    // Verify received into shielded Orchard / Ironwood pool
    const isShielded = Array.isArray(transfer.pools_received) && (
      transfer.pools_received.includes('Ironwood') ||
      transfer.pools_received.includes('Orchard')
    );
    if (!isShielded) continue;

    // Verify exact memo match
    const memos = Array.isArray(transfer.memos) ? transfer.memos : [];
    const memoMatched = memos.some((m) => m === expectedMemo);
    if (!memoMatched) continue;

    // Match found!
    const isConfirmed = transfer.status === 'confirmed';
    const blockHeight = transfer.blockheight || 0;
    const confirmations = (isConfirmed && currentHeight >= blockHeight)
      ? currentHeight - blockHeight + 1
      : 0;

    return {
      txid: transfer.txid,
      amountZatoshis: transfer.value,
      status: transfer.status, // 'confirmed' | 'mempool'
      confirmations,
      blockHeight,
      currentHeight,
      pool: 'Shielded Orchard (Ironwood)',
      memo: expectedMemo,
      memoMatched: true,
      datetime: transfer.datetime,
    };
  }

  return null;
}
