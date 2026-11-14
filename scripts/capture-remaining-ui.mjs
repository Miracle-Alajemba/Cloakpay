import path from 'node:path';
import { launchBrowser } from './cdp-client.mjs';

const ARTIFACT_DIR = '/home/miracle-alajemba/.gemini/antigravity/brain/f85308cf-4649-4843-817f-f0f071d0e28b';

async function captureRemainingUI() {
  const { chrome, cdp } = await launchBrowser();
  try {
    const confirmedSessionId = 'sess_6d6728108aab4d785b05987ee7f015d7';
    console.log(`[Browser] Navigating to http://localhost:3000/?session=${confirmedSessionId}&modal=1...`);
    await cdp.send('Page.navigate', { url: `http://localhost:3000/?session=${confirmedSessionId}&modal=1` });
    await new Promise(r => setTimeout(r, 2000));

    // Wait for the modal to poll verify-payment and transition to confirmed / granted
    console.log('[Browser] Waiting for modal to display confirmed status...');
    let confirmedFound = false;
    for (let i = 0; i < 15; i++) {
      const state = await cdp.evaluate(`
        (() => {
          const modal = document.querySelector('.fixed.inset-0.z-50');
          const text = modal?.innerText || '';
          return {
            textSnippet: text.substring(0, 300),
            isGranted: text.includes('Payment confirmed!') || text.includes('Access Granted')
          };
        })()
      `);
      console.log(`[Modal Check ${i}]:`, state.textSnippet);
      if (state.isGranted) {
        console.log('[Browser] Confirmed state detected on modal!');
        confirmedFound = true;
        break;
      }
      await new Promise(r => setTimeout(r, 1000));
    }

    if (!confirmedFound) {
      throw new Error('Failed to find confirmed status on modal');
    }

    // Capture Screenshot 3: Modal Confirmed
    const screenshot3 = path.join(ARTIFACT_DIR, '03_live_paywall_confirmed.png');
    await cdp.screenshot(screenshot3);
    console.log(`[Browser] Screenshot 3 saved: ${screenshot3}`);

    // Wait for modal exit animation and terminal typewriter streaming
    console.log('[Browser] Waiting for modal close and terminal unlock...');
    await new Promise(r => setTimeout(r, 4000));

    // Reveal full text
    await cdp.evaluate(`
      const ffBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Instant Reveal'));
      if (ffBtn) ffBtn.click();
    `);
    await new Promise(r => setTimeout(r, 1000));

    const terminalCheck = await cdp.evaluate(`
      (() => {
        const text = document.body.innerText;
        return {
          hasUnlockedHeader: text.includes('API RESPONSE STREAM UNLOCKED'),
          hasPatentClause: text.includes('MEMO-BASED ATTESTATION & ROYALTIES'),
          hasSwissRules: text.includes('Swiss Rules of International Arbitration'),
        };
      })()
    `);
    console.log('[Browser] Terminal Unlocked Verification:', terminalCheck);

    // Capture Screenshot 4: Unlocked confidential content in AI Assistant Terminal
    const screenshot4 = path.join(ARTIFACT_DIR, '04_live_terminal_unlocked.png');
    await cdp.screenshot(screenshot4);
    console.log(`[Browser] Screenshot 4 saved: ${screenshot4}`);

    // Capture Screenshot 5: Standalone Simulator mode
    console.log('[Browser] Testing Standalone Simulator mode...');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/?modal=1' });
    await new Promise(r => setTimeout(r, 1500));

    // Switch to simulator
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

  } finally {
    cdp.close();
    chrome.kill();
  }
}

captureRemainingUI().then(() => {
  console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
  process.exit(0);
}).catch(err => {
  console.error('Capture Error:', err);
  process.exit(1);
});
