import path from 'node:path';
import { launchBrowser } from './cdp-client.mjs';

const ARTIFACT_DIR = '/home/miracle-alajemba/.gemini/antigravity/brain/f85308cf-4649-4843-817f-f0f071d0e28b';

const VIEWPORTS = [
  { width: 695, height: 852, name: 'modal_695x852.png' },
  { width: 1366, height: 768, name: 'modal_1366x768.png' },
  { width: 1440, height: 900, name: 'modal_1440x900.png' },
];

async function run() {
  const { chrome, cdp } = await launchBrowser();
  try {
    console.log('[Browser] Navigating to http://localhost:3000/?modal=1...');
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/?modal=1' });
    await new Promise((r) => setTimeout(r, 2000));

    for (const vp of VIEWPORTS) {
      console.log(`\n━━━ Testing Viewport ${vp.width}x${vp.height} ━━━`);
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: false,
      });
      await new Promise((r) => setTimeout(r, 800));

      // Inspect modal metrics
      const metrics = await cdp.evaluate(`
        (() => {
          const allDivs = Array.from(document.querySelectorAll("div"));
          const modalBox = allDivs.find(d => d.textContent.includes("Zcash Shielded Payment Request") && d.classList.contains("bg-cloak-900"));
          if (!modalBox) return { found: false };

          const modalBody = modalBox.querySelector('.overflow-y-auto');
          const qrSvg = modalBox.querySelector('svg.text-slate-950') || modalBox.querySelector('.bg-white svg');
          const qrBox = qrSvg ? qrSvg.closest('.bg-white') : null;

          const boxRect = modalBox.getBoundingClientRect();
          const qrRect = qrBox ? qrBox.getBoundingClientRect() : null;

          return {
            window: { width: window.innerWidth, height: window.innerHeight },
            modalBox: {
              clientHeight: modalBox.clientHeight,
              scrollHeight: modalBox.scrollHeight,
              top: boxRect.top,
              bottom: boxRect.bottom,
              height: boxRect.height
            },
            modalBody: modalBody ? {
              clientHeight: modalBody.clientHeight,
              scrollHeight: modalBody.scrollHeight,
              hasScrollbar: modalBody.scrollHeight > modalBody.clientHeight
            } : null,
            qr: qrRect ? {
              top: qrRect.top,
              bottom: qrRect.bottom,
              width: qrRect.width,
              height: qrRect.height,
              isFullyInView: qrRect.top >= 0 && qrRect.bottom <= window.innerHeight
            } : null
          };
        })()
      `);

      console.log('Metrics:', JSON.stringify(metrics, null, 2));

      const screenshotPath = path.join(ARTIFACT_DIR, vp.name);
      await cdp.screenshot(screenshotPath);
      console.log(`Saved screenshot to: ${screenshotPath}`);

      if (metrics.modalBody?.hasScrollbar) {
        console.warn(`WARNING: modalBody still has scrollbar! scrollHeight (${metrics.modalBody.scrollHeight}) > clientHeight (${metrics.modalBody.clientHeight})`);
      } else {
        console.log(`SUCCESS: Zero-scroll verified! scrollHeight (${metrics.modalBody?.scrollHeight}) <= clientHeight (${metrics.modalBody?.clientHeight})`);
      }
    }
  } finally {
    cdp.close();
    chrome.kill();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
