import { spawn } from 'node:child_process';
import path from 'node:path';

const ZINGO_CLI = process.env.ZINGO_CLI_PATH || '/home/miracle-alajemba/.cargo/bin/zingo-cli';
const MERCHANT_DATA_DIR = process.env.MERCHANT_DATA_DIR || '/home/miracle-alajemba/.cache/cp_merchant_watch';
const ZINGO_SERVER = process.env.ZINGO_SERVER || 'https://testnet.zec.rocks:443';
const IPV4_PRELOAD = process.env.ZINGO_PRELOAD || '/home/miracle-alajemba/.cache/ipv4_only.so';

/**
 * Queries the merchant watch-only wallet on public Zcash Testnet.
 * Resolves with all received value transfers and the current chain height.
 */
export async function queryMerchantWallet() {
  return new Promise((resolve, reject) => {
    const proc = spawn(ZINGO_CLI, [
      '--chain', 'testnet',
      '--server', ZINGO_SERVER,
      '--data-dir', MERCHANT_DATA_DIR,
    ], {
      env: {
        ...process.env,
        LD_PRELOAD: IPV4_PRELOAD,
      },
    });

    let stdout = '';
    let stderr = '';
    let commandsSent = false;

    proc.stdout.on('data', (d) => {
      stdout += d;
      // Send commands once the interactive prompt is ready and background sync has had a moment to scan
      if (!commandsSent && stdout.includes('>>')) {
        commandsSent = true;
        setTimeout(() => {
          try {
            proc.stdin.write('messages\nheight\nquit\n');
          } catch (e) {
            // proc may have closed
          }
        }, 2500);
      }
    });
    proc.stderr.on('data', (d) => { stderr += d; });

    const timeout = setTimeout(() => {
      proc.kill('SIGKILL');
      reject(new Error('Scanner query timed out after 30 seconds'));
    }, 30000);

    proc.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== 0 && !stdout.includes('"value_transfers"')) {
        return reject(new Error(`Scanner exited with code ${code}: ${stderr || stdout}`));
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
        });
      } catch (err) {
        reject(new Error(`Failed to parse scanner output: ${err.message}`));
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
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
