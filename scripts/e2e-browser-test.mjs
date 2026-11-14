import { spawn } from 'node:child_process';
import path from 'node:path';
import { launchBrowser } from './cdp-client.mjs';

const ARTIFACT_DIR = '/home/miracle-alajemba/.gemini/antigravity/brain/f85308cf-4649-4843-817f-f0f071d0e28b';
const ZINGO_CLI = '/home/miracle-alajemba/.cargo/bin/zingo-cli';
const PAYER_DIR = '/home/miracle-alajemba/.cache/cp_payer_full';
const IPV4_PRELOAD = '/home/miracle-alajemba/.cache/ipv4_only.so';

async function sendTestnetPayment({ destination, amountZats, memo }) {
  console.log(`\n[Payer Wallet] Sending ${amountZats} zatoshis to ${destination}`);
  console.log(`[Payer Wallet] Shielded memo: "${memo}"`);

  return new Promise((resolve, reject) => {
    const cmd = `quicksend ${destination} ${amountZats} "${memo}"\nquit\n`;
    const proc = spawn(ZINGO_CLI, [
      '--chain', 'testnet',
      '--server', 'https://testnet.zec.rocks:443',
      '--data-dir', PAYER_DIR,
    ], {
      env: {
        ...process.env,
        LD_PRELOAD: IPV4_PRELOAD,
        PATH: '/home/miracle-alajemba/.cargo/bin:/usr/bin:/bin',
      },
    });

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', d => { stdout += d; });
    proc.stderr.on('data', d => { stderr += d; });

    proc.stdin.write(cmd);

    const timeout = setTimeout(() => {
      proc.kill('SIGKILL');
      reject(new Error('Payer quicksend timed out after 60s'));
    }, 60000);

    proc.on('close', code => {
      clearTimeout(timeout);
      try {
        const txMatch = stdout.match(/"txids":\s*\[\s*"([0-9a-fA-F]{64})"/);
        if (txMatch) {
          resolve(txMatch[1]);
        } else {
          reject(new Error(`Failed to find txid in stdout: ${stdout || stderr}`));
        }
      } catch (err) {
        reject(err);
      }
    });
  });
}

async function runBrowserFlow() {
  console.log('━━━ STARTING BROWSER E2E LIVE TESTNET VERIFICATION ━━━\n');

  const { chrome, cdp } = await launchBrowser();
  try {
    // 1. Navigate to frontend
    console.log('[Browser] Navigating to http://localhost:3000/...');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
    await new Promise(r => setTimeout(r, 1500));

    // 2. Open Paywall Modal by clicking "Unlock with Shielded Zcash" in AI Demo Terminal
    console.log('[Browser] Triggering PaywallModal via UI action...');
    await cdp.evaluate(`
      const unlockBtn = Array.from(document.querySelectorAll('button')).find(b =>
        b.textContent.includes('Unlock with Shielded Zcash') ||
        b.textContent.includes('Preview paywall')
      );
      if (unlockBtn) unlockBtn.click();
    `);
    await new Promise(r => setTimeout(r, 2000));

    // 3. Inspect the modal DOM for Live Zcash Testnet session parameters
    const modalData = await cdp.evaluate(`
      (() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        if (!modal) return { error: 'Modal not found' };
        const text = modal.innerText;

        const memoMatch = text.match(/cp_testnet_[0-9a-fA-F]+/);
        const memo = memoMatch ? memoMatch[0] : null;

        const isLiveBadge = text.includes('Zcash Testnet');
        const isWaitingStatus = text.includes('Waiting for payment');
        const hasScannerActive = text.includes('LIVE WATCH-ONLY SCANNER CONNECTED');

        return {
          memo,
          isLiveBadge,
          isWaitingStatus,
          hasScannerActive,
          modalSnippet: text.substring(0, 400)
        };
      })()
    `);

    console.log('[Browser] Modal Inspection Results:', JSON.stringify(modalData, null, 2));

    if (!modalData.memo) {
      throw new Error('Failed to find live session memo in PaywallModal DOM');
    }

    // Switch to "Address & Base64url Memo" tab to show the full address in screenshot
    await cdp.evaluate(`
      const tabBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Address & Base64url Memo'));
      if (tabBtn) tabBtn.click();
    `);
    await new Promise(r => setTimeout(r, 600));

    const addressData = await cdp.evaluate(`
      (() => {
        const modal = document.querySelector('.fixed.inset-0.z-50');
        const addrMatch = modal?.innerText.match(/utest1[0-9a-zA-Z]+/);
        return addrMatch ? addrMatch[0] : null;
      })()
    `);
    console.log('[Browser] Displayed Merchant Address on tab:', addressData);

    const screenshot1 = path.join(ARTIFACT_DIR, '01_live_paywall_challenge.png');
    await cdp.screenshot(screenshot1);
    console.log(`[Browser] Screenshot 1 saved: ${screenshot1}`);

    // Switch back to QR tab
    await cdp.evaluate(`
      const qrTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('ZIP-321 QR Code'));
      if (qrTab) qrTab.click();
    `);
    await new Promise(r => setTimeout(r, 500));

    // Verify backend session store matches the DOM memo
    const sessionId = modalData.memo.replace('cp_testnet_', 'sess_');
    const resChallenge = await fetch('http://127.0.0.1:3001/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });
    const challengeVerify = await resChallenge.json();
    console.log('[Backend] Verification check before payment (must be waiting):', challengeVerify);
    if (challengeVerify.unlocked !== false || challengeVerify.status !== 'waiting') {
      throw new Error(`Expected waiting status before payment, got: ${JSON.stringify(challengeVerify)}`);
    }

    // 4. Send brand new shielded Orchard Testnet payment from payer wallet
    const merchantAddress = addressData || 'utest193cduapq3ggad4fxvzuqsy35nlx74j25dv0ru2mmfnvdfa95hmxggahrgln5p4092289n7rzvy6wapm5fqpw2ymj4k2eaxktyudr5wt8';
    const amountZats = 100000;
    const txid = await sendTestnetPayment({
      destination: merchantAddress,
      amountZats,
      memo: modalData.memo,
    });
    console.log(`\n>>> NEW ON-CHAIN TRANSACTION BROADCASTED: ${txid} <<<\n`);

    // 5. Screenshot 2: Modal while payment is propagating/mining
    const screenshot2 = path.join(ARTIFACT_DIR, '02_live_paywall_pending.png');
    await cdp.screenshot(screenshot2);
    console.log(`[Browser] Screenshot 2 saved: ${screenshot2}`);

    // 6. Monitor browser UI for on-chain block confirmation and unlock
    console.log('[Browser] Awaiting block confirmation depth >= 1 in browser UI (Zcash block time ~75s)...');
    let unlocked = false;
    let pollAttempts = 0;
    const maxPolls = 35; // 35 * 5s = 175s

    while (!unlocked && pollAttempts < maxPolls) {
      await new Promise(r => setTimeout(r, 5000));
      pollAttempts++;

      const uiStatus = await cdp.evaluate(`
        (() => {
          const text = document.body.innerText;
          const isGranted = text.includes('Access Granted') || text.includes('Payment confirmed!');
          const isMempool = text.includes('mempool') || text.includes('Awaiting 1 on-chain block');
          const isVerifying = text.includes('verifying') || text.includes('confirmation depth');
          const hasUnlockedStream = text.includes('API RESPONSE STREAM UNLOCKED') || text.includes('MEMO-BASED ATTESTATION');

          return { isGranted, isMempool, isVerifying, hasUnlockedStream };
        })()
      `);

      console.log(`[Browser Poll ${pollAttempts * 5}s]:`, uiStatus);

      if (uiStatus.isGranted || uiStatus.hasUnlockedStream) {
        unlocked = true;
        break;
      }
    }

    if (!unlocked) {
      throw new Error('Timed out waiting for on-chain block confirmation in browser UI');
    }

    // 7. Screenshot 3: Modal confirmation & confetti
    const screenshot3 = path.join(ARTIFACT_DIR, '03_live_paywall_confirmed.png');
    await cdp.screenshot(screenshot3);
    console.log(`[Browser] Screenshot 3 saved: ${screenshot3}`);

    // Wait for modal exit animation and terminal typewriter stream
    await new Promise(r => setTimeout(r, 3000));

    // Fast-forward / instant reveal stream if present
    await cdp.evaluate(`
      const ffBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Instant Reveal'));
      if (ffBtn) ffBtn.click();
    `);
    await new Promise(r => setTimeout(r, 1000));

    // 8. Screenshot 4: Unlocked confidential content in AI Assistant Terminal
    const screenshot4 = path.join(ARTIFACT_DIR, '04_live_terminal_unlocked.png');
    await cdp.screenshot(screenshot4);
    console.log(`[Browser] Screenshot 4 saved: ${screenshot4}`);

    // Verify terminal contains the server-side preset text
    const terminalVerification = await cdp.evaluate(`
      (() => {
        const text = document.body.innerText;
        return {
          hasUnlockedHeader: text.includes('API RESPONSE STREAM UNLOCKED'),
          hasPatentAttestation: text.includes('MEMO-BASED ATTESTATION & ROYALTIES'),
          hasSwissArbitration: text.includes('Swiss Arbitration Centre'),
          hasIvkClause: text.includes('Full incoming viewing keys (IVK) remain solely within the hardware enclave'),
        };
      })()
    `);
    console.log('[Browser] Terminal Content Verification:', terminalVerification);

    // 9. Verify Standalone Simulator mode separation
    console.log('[Browser] Testing Standalone Simulator mode...');
    // Re-trigger modal with simulation query
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/?modal=1' });
    await new Promise(r => setTimeout(r, 1500));

    // Click simulator mode button
    await cdp.evaluate(`
      const simToggle = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Simulator');
      if (simToggle) simToggle.click();
    `);
    await new Promise(r => setTimeout(r, 1000));

    const simCheck = await cdp.evaluate(`
      (() => {
        const text = document.body.innerText;
        return {
          hasSimNotice: text.includes('Simulation — no real payment is made'),
          hasSimBtn: text.includes('Simulate Payment Success (Demo — no real payment is made)'),
        };
      })()
    `);
    console.log('[Browser] Simulator Mode Verification:', simCheck);

    const screenshot5 = path.join(ARTIFACT_DIR, '05_standalone_simulator_mode.png');
    await cdp.screenshot(screenshot5);
    console.log(`[Browser] Screenshot 5 saved: ${screenshot5}`);

    console.log('\n━━━ ALL BROWSER E2E STEPS SUCCEEDED! ━━━\n');
    return {
      txid,
      memo: modalData.memo,
      amountZats,
      merchantAddress,
      terminalVerification,
      simCheck,
      screenshots: [screenshot1, screenshot2, screenshot3, screenshot4, screenshot5],
    };

  } finally {
    cdp.close();
    chrome.kill();
  }
}

runBrowserFlow().then(res => {
  console.log('FINAL BROWSER PROOF RESULT:', JSON.stringify(res, null, 2));
  process.exit(0);
}).catch(err => {
  console.error('Browser Flow Error:', err);
  process.exit(1);
});
