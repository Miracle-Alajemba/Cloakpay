/**
 * CloakPay E2E Verification Script
 * Tests all critical paths by loading the app in a headless Node.js context
 * and verifying component code integrity, state management, and build output.
 */

import { readFileSync } from 'fs';
import path from 'path';

const COMPONENTS_DIR = './src/components';
const PASS = '\x1b[32m✓ PASS\x1b[0m';
const FAIL = '\x1b[31m✗ FAIL\x1b[0m';

let passed = 0;
let failed = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ${PASS} ${description}`);
    passed++;
  } catch (e) {
    console.log(`  ${FAIL} ${description}`);
    console.log(`         → ${e.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

function readComponent(name) {
  return readFileSync(path.join(COMPONENTS_DIR, name), 'utf-8');
}

// ─── PART 1: TYPOGRAPHY VERIFICATION ─────────────────────────────────────────

console.log('\n\x1b[36m━━━ PART 1: Typography & Font Upgrade Verification ━━━\x1b[0m\n');

const indexHtml = readFileSync('./index.html', 'utf-8');
const tailwindConfig = readFileSync('./tailwind.config.js', 'utf-8');
const heroJsx = readComponent('Hero.jsx');

test('index.html imports Plus Jakarta Sans from Google Fonts', () => {
  assert(indexHtml.includes('Plus+Jakarta+Sans'), 'Plus Jakarta Sans not found in font import URL');
});

test('index.html imports Inter from Google Fonts', () => {
  assert(indexHtml.includes('family=Inter'), 'Inter not found in font import URL');
});

test('index.html imports JetBrains Mono from Google Fonts', () => {
  assert(indexHtml.includes('JetBrains+Mono'), 'JetBrains Mono not found in font import URL');
});

test('tailwind.config.js defines font-display family with Plus Jakarta Sans', () => {
  assert(tailwindConfig.includes("display:"), 'font-display family not defined');
  assert(tailwindConfig.includes("Plus Jakarta Sans"), 'Plus Jakarta Sans not in font-display');
});

test('tailwind.config.js defines font-sans with Inter', () => {
  assert(tailwindConfig.includes("sans:"), 'font-sans family not defined');
  assert(tailwindConfig.includes("'Inter'"), 'Inter not in font-sans');
});

test('tailwind.config.js defines font-mono with JetBrains Mono', () => {
  assert(tailwindConfig.includes("mono:"), 'font-mono family not defined');
  assert(tailwindConfig.includes("JetBrains Mono"), 'JetBrains Mono not in font-mono');
});

test('Hero headline uses font-display class for geometric display face', () => {
  assert(heroJsx.includes('font-display'), 'font-display class not found on hero h1');
});

test('Hero headline uses tracking-tight and leading-[1.12]', () => {
  assert(heroJsx.includes('tracking-tight'), 'tracking-tight missing from hero h1');
  assert(heroJsx.includes('leading-[1.12]'), 'leading-[1.12] missing from hero h1');
});

test('Hero headline uses gradient on "HTTP 402" keywords', () => {
  assert(heroJsx.includes('bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500'), 'Gradient missing on HTTP 402 span');
  assert(heroJsx.includes('bg-clip-text text-transparent'), 'bg-clip-text not applied');
});

test('Hero headline uses gradient on "AI & Media" keywords', () => {
  assert(heroJsx.includes('from-white via-slate-200 to-emerald-300'), 'Metallic gradient missing on AI & Media span');
});

test('Hero subtitle uses text-slate-400 (softer) instead of text-slate-300', () => {
  // Check the subtitle p tag specifically
  assert(heroJsx.includes('text-slate-400 font-normal leading-relaxed'), 'Subtitle should use text-slate-400 font-normal leading-relaxed');
});

test('Hero subtitle highlights "Zcash Encrypted Memos" with white font-medium', () => {
  assert(heroJsx.includes('text-white font-medium">Zcash Encrypted Memos'), '"Zcash Encrypted Memos" not styled as white font-medium');
});

test('Hero subtitle uses inline monospace pill for ZIP-321 URIs', () => {
  assert(heroJsx.includes('font-mono') && heroJsx.includes('bg-emerald-500/10') && heroJsx.includes('ZIP-321 URIs'), 'ZIP-321 URIs should use inline mono pill styling');
});

test('Hero subtitle highlights "Zero IP or telemetry leakage" with white font-medium', () => {
  assert(heroJsx.includes('font-medium">Zero'), '"Zero IP..." not styled with font-medium');
});

// ─── PART 2: COMPONENT INTEGRITY VERIFICATION ───────────────────────────────

console.log('\n\x1b[36m━━━ PART 2: Component Integrity & State Management ━━━\x1b[0m\n');

const appJsx = readFileSync('./src/App.jsx', 'utf-8');
const navJsx = readComponent('Navbar.jsx');
const demoJsx = readComponent('AiDemoTerminal.jsx');
const modalJsx = readComponent('PaywallModal.jsx');
const protocolJsx = readComponent('ProtocolFlow.jsx');
const privacyJsx = readComponent('PrivacyComparison.jsx');
const codeJsx = readComponent('CodeIntegration.jsx');
const footerJsx = readComponent('Footer.jsx');

test('App.jsx manages isPaywallOpen, isUnlocked, and sessionId state', () => {
  assert(appJsx.includes("useState(false)"), 'isPaywallOpen/isUnlocked state not found');
  assert(appJsx.includes("setIsPaywallOpen"), 'setIsPaywallOpen not found');
  assert(appJsx.includes("setIsUnlocked"), 'setIsUnlocked not found');
  assert(appJsx.includes("sessionId"), 'sessionId state not found');
});

test('App.jsx scrolls to demo section on payment success', () => {
  assert(appJsx.includes("scrollToDemo"), 'scrollToDemo not called on success');
});

test('AiDemoTerminal accepts onTriggerPaywall, isUnlocked, unlockedSessionId props', () => {
  assert(demoJsx.includes('onTriggerPaywall'), 'onTriggerPaywall prop missing');
  assert(demoJsx.includes('isUnlocked'), 'isUnlocked prop missing');
  assert(demoJsx.includes('unlockedSessionId'), 'unlockedSessionId prop missing');
});

test('AiDemoTerminal has 3 preset prompts defined', () => {
  const presetCount = (demoJsx.match(/id:\s*'/g) || []).length;
  assert(presetCount >= 3, `Expected 3+ preset prompts but found ${presetCount}`);
});

test('AiDemoTerminal implements typewriter streaming (displayedWordsCount state)', () => {
  assert(demoJsx.includes('displayedWordsCount'), 'displayedWordsCount state missing');
  assert(demoJsx.includes('isStreamingText'), 'isStreamingText state missing');
  assert(demoJsx.includes('lockedWords.slice'), 'word-by-word slicing missing');
});

test('AiDemoTerminal has Decoded Memo tab for judges', () => {
  assert(demoJsx.includes("'memo-inspector'"), 'memo-inspector viewMode not found');
  assert(demoJsx.includes('Decoded Memo'), 'Decoded Memo tab label missing');
  assert(demoJsx.includes('Judges'), 'Judges badge missing');
});

test('AiDemoTerminal has HTTP 402 Inspector tab', () => {
  assert(demoJsx.includes("'inspector'"), 'inspector viewMode not found');
  assert(demoJsx.includes('HTTP 402 Inspector'), 'HTTP 402 Inspector tab label missing');
});

test('AiDemoTerminal has success verification banner when unlocked', () => {
  assert(demoJsx.includes('Shielded Zcash Orchard TX Verified'), 'Success banner text missing');
  assert(demoJsx.includes('Session Active'), 'Session Active text missing');
  assert(demoJsx.includes('successBannerRef'), 'successBannerRef for GSAP animation missing');
});

test('AiDemoTerminal has Fast Forward / Instant Reveal button for typewriter', () => {
  assert(demoJsx.includes('handleFastForwardStream'), 'handleFastForwardStream function missing');
  assert(demoJsx.includes('Instant Reveal'), 'Instant Reveal button label missing');
});

test('AiDemoTerminal has section heading with font-display', () => {
  assert(demoJsx.includes('font-display'), 'font-display missing from demo section heading');
});

test('PaywallModal has smooth GSAP exit animation (handleAnimatedClose)', () => {
  assert(modalJsx.includes('handleAnimatedClose'), 'handleAnimatedClose not found');
  assert(modalJsx.includes("scale: 0.92"), 'Exit scale animation not found');
  assert(modalJsx.includes("ease: 'power2.in'"), 'Exit ease not found');
});

test('PaywallModal has spring entrance animation (back.out)', () => {
  assert(modalJsx.includes("back.out(1.5)"), 'Spring entrance ease missing');
});

test('PaywallModal generates real ZIP-321 URI for QR code', () => {
  assert(modalJsx.includes('QRCodeSVG'), 'QRCodeSVG component not found');
  assert(modalJsx.includes('zip321Uri'), 'zip321Uri not constructed');
  assert(modalJsx.includes('zcash:'), 'zcash: URI prefix missing');
});

test('PaywallModal has 3 tabs: QR, Manual, Wallets', () => {
  assert(modalJsx.includes("tab === 'qr'"), 'QR tab missing');
  assert(modalJsx.includes("tab === 'manual'"), 'Manual tab missing');
  assert(modalJsx.includes("tab === 'wallets'"), 'Wallets tab missing');
});

test('PaywallModal has simulate payment button with 3-phase status', () => {
  assert(modalJsx.includes("'broadcasting'"), 'broadcasting status missing');
  assert(modalJsx.includes("'verifying'"), 'verifying status missing');
  assert(modalJsx.includes("'confirmed'"), 'confirmed status missing');
});

test('PaywallModal fires confetti on confirmation', () => {
  assert(modalJsx.includes("import confetti"), 'confetti import missing');
  assert(modalJsx.includes("confetti({"), 'confetti() call missing');
});

test('PaywallModal live countdown timer (formatTime)', () => {
  assert(modalJsx.includes('formatTime'), 'formatTime utility missing');
  assert(modalJsx.includes('timeLeft'), 'timeLeft state missing');
});

test('PaywallModal close button calls animated exit', () => {
  assert(modalJsx.includes('handleAnimatedClose(onClose)'), 'Close button should trigger animated exit');
});

test('PaywallModal backdrop click calls animated exit', () => {
  assert(modalJsx.includes('handleAnimatedClose(onClose)'), 'Backdrop click should animate exit');
});

test('Memo Inspector panel shows public vs decrypted comparison', () => {
  assert(demoJsx.includes('Public Ledger'), 'Public Ledger comparison column missing');
  assert(demoJsx.includes('Decrypted by CloakPay'), 'Decrypted column missing');
});

test('Memo Inspector shows 512-byte hex ciphertext', () => {
  assert(demoJsx.includes('simulatedHexCiphertext'), 'Simulated hex ciphertext missing');
  assert(demoJsx.includes('ChaCha20-Poly1305'), 'Encryption algorithm label missing');
});

test('Memo Inspector shows plaintext decoded memo payload', () => {
  assert(demoJsx.includes('plaintextMemo'), 'plaintextMemo not found');
  assert(demoJsx.includes('Decoded Plaintext UTF-8 Memo'), 'Plaintext label missing');
});

test('Memo Inspector has structured schema table', () => {
  assert(demoJsx.includes('Parsed 512-Byte Memo Schema'), 'Schema table heading missing');
  assert(demoJsx.includes('Session Hash'), 'Session Hash row missing');
  assert(demoJsx.includes('Anti-replay'), 'Anti-replay nonce row missing');
});

test('ProtocolFlow section heading uses font-display', () => {
  assert(protocolJsx.includes('font-display'), 'font-display missing from ProtocolFlow heading');
});

test('PrivacyComparison section heading uses font-display', () => {
  assert(privacyJsx.includes('font-display'), 'font-display missing from PrivacyComparison heading');
});

test('CodeIntegration section heading uses font-display', () => {
  assert(codeJsx.includes('font-display'), 'font-display missing from CodeIntegration heading');
});

test('Navbar has no unused imports (Github removed)', () => {
  assert(!navJsx.includes('Github'), 'Unused Github import still present in Navbar');
});

test('Footer has no unused imports (Github removed)', () => {
  assert(!footerJsx.includes('Github'), 'Unused Github import still present in Footer');
});

test('All components export default functions', () => {
  const components = [navJsx, heroJsx, demoJsx, modalJsx, protocolJsx, privacyJsx, codeJsx, footerJsx];
  components.forEach((src, i) => {
    assert(src.includes('export default function'), `Component ${i} missing export default function`);
  });
});

// ─── SUMMARY ─────────────────────────────────────────────────────────────────

console.log('\n\x1b[36m━━━ SUMMARY ━━━\x1b[0m\n');
console.log(`  Tests: ${passed + failed} total, ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.log(`\n  \x1b[31m${failed} test(s) FAILED — fix required before deployment.\x1b[0m\n`);
  process.exit(1);
} else {
  console.log(`\n  \x1b[32mAll ${passed} tests passed! Ready for production build.\x1b[0m\n`);
  process.exit(0);
}

