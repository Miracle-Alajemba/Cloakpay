import path from 'node:path';
import { launchBrowser } from './cdp-client.mjs';

const ARTIFACT_DIR = '/home/miracle-alajemba/.gemini/antigravity/brain/f85308cf-4649-4843-817f-f0f071d0e28b';

async function waitForSelector(cdp, selector, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const found = await cdp.evaluate(`!!document.querySelector('${selector}')`);
    if (found) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Timeout waiting for selector: ${selector}`);
}

async function capture() {
  const { chrome, cdp } = await launchBrowser();
  try {
    console.log('[Capture] Capturing desktop after screenshots (1440x900)...');

    // Set Desktop viewport
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    // 1. Desktop Hero
    await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
    await waitForSelector(cdp, 'h1');
    await new Promise((r) => setTimeout(r, 1200));
    await cdp.evaluate(`window.scrollTo(0, 0);`);
    await new Promise((r) => setTimeout(r, 300));
    await cdp.screenshot(path.join(ARTIFACT_DIR, 'after_desktop_hero.png'));
    console.log('  ✓ Captured after_desktop_hero.png');

    // 2. Desktop Workbench
    await cdp.evaluate(`
      const el = document.getElementById('demo');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    `);
    await new Promise((r) => setTimeout(r, 800));
    await cdp.screenshot(path.join(ARTIFACT_DIR, 'after_desktop_workbench.png'));
    console.log('  ✓ Captured after_desktop_workbench.png');

    // 3. Desktop Developers / Code Panel
    await cdp.evaluate(`
      const el = document.getElementById('developers');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    `);
    await new Promise((r) => setTimeout(r, 800));
    await cdp.screenshot(path.join(ARTIFACT_DIR, 'after_desktop_developers.png'));
    console.log('  ✓ Captured after_desktop_developers.png');

    // 4. Desktop Footer
    await cdp.evaluate(`
      window.scrollTo(0, document.body.scrollHeight);
    `);
    await new Promise((r) => setTimeout(r, 800));
    await cdp.screenshot(path.join(ARTIFACT_DIR, 'after_desktop_footer.png'));
    console.log('  ✓ Captured after_desktop_footer.png');

    // 5. Desktop Modal
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/?modal=1' });
    await waitForSelector(cdp, 'svg');
    await new Promise((r) => setTimeout(r, 1200));
    await cdp.screenshot(path.join(ARTIFACT_DIR, 'after_desktop_modal.png'));
    console.log('  ✓ Captured after_desktop_modal.png');

    console.log('\n[Capture] Capturing mobile after screenshots (390x844)...');

    // Set Mobile viewport
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });

    // 6. Mobile Hero
    await cdp.send('Page.navigate', { url: 'http://localhost:3000' });
    await waitForSelector(cdp, 'h1');
    await new Promise((r) => setTimeout(r, 1200));
    await cdp.evaluate(`window.scrollTo(0, 0);`);
    await new Promise((r) => setTimeout(r, 300));
    await cdp.screenshot(path.join(ARTIFACT_DIR, 'after_mobile_hero.png'));
    console.log('  ✓ Captured after_mobile_hero.png');

    // 7. Mobile Workbench
    await cdp.evaluate(`
      const el = document.getElementById('demo');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    `);
    await new Promise((r) => setTimeout(r, 800));
    await cdp.screenshot(path.join(ARTIFACT_DIR, 'after_mobile_workbench.png'));
    console.log('  ✓ Captured after_mobile_workbench.png');

    // 8. Mobile Developers / Code Panel
    await cdp.evaluate(`
      const el = document.getElementById('developers');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    `);
    await new Promise((r) => setTimeout(r, 800));
    await cdp.screenshot(path.join(ARTIFACT_DIR, 'after_mobile_developers.png'));
    console.log('  ✓ Captured after_mobile_developers.png');

    // 9. Mobile Footer
    await cdp.evaluate(`
      window.scrollTo(0, document.body.scrollHeight);
    `);
    await new Promise((r) => setTimeout(r, 800));
    await cdp.screenshot(path.join(ARTIFACT_DIR, 'after_mobile_footer.png'));
    console.log('  ✓ Captured after_mobile_footer.png');

    // 10. Mobile Modal
    await cdp.send('Page.navigate', { url: 'http://localhost:3000/?modal=1' });
    await waitForSelector(cdp, 'svg');
    await new Promise((r) => setTimeout(r, 1200));
    await cdp.screenshot(path.join(ARTIFACT_DIR, 'after_mobile_modal.png'));
    console.log('  ✓ Captured after_mobile_modal.png');

    console.log('\nAll 10 after screenshots successfully captured!');
  } finally {
    cdp.close();
    chrome.kill();
  }
}

capture().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
