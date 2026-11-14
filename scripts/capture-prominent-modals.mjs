import path from 'node:path';
import { launchBrowser } from './cdp-client.mjs';

const ARTIFACT_DIR = '/home/miracle-alajemba/.gemini/antigravity/brain/f85308cf-4649-4843-817f-f0f071d0e28b';

async function captureModalScreenshots() {
  const { chrome, cdp } = await launchBrowser();
  try {
    console.log('[Browser] Navigating to http://localhost:3000/?modal=1...');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/?modal=1' });
    await new Promise(r => setTimeout(r, 2000));

    // Capture 1: Live Zcash Testnet mode (default)
    const screenshotTestnet = path.join(ARTIFACT_DIR, 'prominent_live_testnet_modal.png');
    await cdp.screenshot(screenshotTestnet);
    console.log('[Browser] Saved:', screenshotTestnet);

    // Switch to Standalone Simulator mode
    await cdp.evaluate(`
      const simBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Standalone Simulator'));
      if (simBtn) simBtn.click();
    `);
    await new Promise(r => setTimeout(r, 1000));

    // Capture 2: Standalone Simulator mode
    const screenshotSim = path.join(ARTIFACT_DIR, 'prominent_simulator_modal.png');
    await cdp.screenshot(screenshotSim);
    console.log('[Browser] Saved:', screenshotSim);

  } finally {
    cdp.close();
    chrome.kill();
  }
}

captureModalScreenshots().then(() => {
  console.log('Screenshots captured successfully!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
