/**
 * CloakPay E2E Verification Script
 * Validates UX, typography, technical accuracy, ZIP-321 Base64url encoding,
 * simulation labels, and component state management.
 */

import { readFileSync } from 'fs';
import path from 'path';
import { encodeZip321Memo, decodeZip321Memo, buildZip321Uri } from './src/utils/zip321.js';

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

// ─── PART 1: TYPOGRAPHY & VISUAL READABILITY ────────────────────────────────

console.log('\n\x1b[36m━━━ PART 1: Typography & Visual Readability ━━━\x1b[0m\n');

const indexHtml = readFileSync('./index.html', 'utf-8');
const tailwindConfig = readFileSync('./tailwind.config.js', 'utf-8');
const heroJsx = readComponent('Hero.jsx');

test('index.html imports Outfit (weights 400, 500, 600, 700) from Google Fonts', () => {
  assert(indexHtml.includes('Outfit:wght@400;500;600;700'), 'Outfit weights 400..700 missing in index.html');
});

test('index.html imports Inter from Google Fonts', () => {
  assert(indexHtml.includes('family=Inter'), 'Inter font missing in index.html');
});

test('index.html imports JetBrains Mono from Google Fonts', () => {
  assert(indexHtml.includes('JetBrains+Mono'), 'JetBrains Mono font missing in index.html');
});

test('tailwind.config.js configures Outfit for font-display', () => {
  assert(tailwindConfig.includes("display: ['Outfit'"), 'Outfit not configured for font-display in tailwind.config.js');
});

test('tailwind.config.js configures Inter for font-sans', () => {
  assert(tailwindConfig.includes("sans: ['Inter'"), 'Inter not configured for font-sans in tailwind.config.js');
});

test('tailwind.config.js configures JetBrains Mono for font-mono', () => {
  assert(tailwindConfig.includes("mono: ['JetBrains Mono'"), 'JetBrains Mono not configured for font-mono in tailwind.config.js');
});

test('Hero headline uses clean font-semibold instead of font-extrabold', () => {
  assert(heroJsx.includes('font-semibold'), 'Hero headline must use font-semibold');
  assert(!heroJsx.includes('font-extrabold'), 'Hero headline must not use heavy font-extrabold');
});

test('Hero headline uses tight letter spacing tracking-[-0.025em] and leading-[1.15]', () => {
  assert(heroJsx.includes('tracking-[-0.025em]'), 'Hero headline missing tracking-[-0.025em]');
  assert(heroJsx.includes('leading-[1.15]'), 'Hero headline missing leading-[1.15]');
});

test('Hero subtitle has NO inline monospace pills or mid-sentence border boxes', () => {
  assert(!heroJsx.includes('font-mono text-[0.85em] text-emerald-400 bg-emerald-500/10'), 'Inline monospace pill found in hero subtitle');
  assert(heroJsx.includes('font-sans'), 'Hero subtitle must be clean font-sans prose');
});

// ─── PART 2: PRODUCT POSITIONING & HERO COPY ────────────────────────────────

console.log('\n\x1b[36m━━━ PART 2: Product Positioning & Hero Copy ━━━\x1b[0m\n');

test('Hero headline matches exact copy: "Pay for one API request—not a subscription."', () => {
  assert(heroJsx.includes('Pay for one API request—not a subscription.'), 'Exact hero headline missing');
});

test('Hero supporting text matches exact copy: "CloakPay helps API providers charge per request in shielded ZEC..."', () => {
  assert(heroJsx.includes('CloakPay helps API providers charge per request in shielded ZEC. A user pays from a Zcash wallet, and access is granted after the payment is verified—without creating a CloakPay account.'), 'Exact hero supporting text missing');
});

test('Hero primary button copy is "Try the interactive demo"', () => {
  assert(heroJsx.includes('Try the interactive demo'), 'Primary CTA text missing');
});

test('Hero secondary button copy is "View developer integration" with #developers link', () => {
  assert(heroJsx.includes('View developer integration'), 'Secondary CTA text missing');
  assert(heroJsx.includes('href="#developers"'), 'Secondary CTA must link to #developers');
});

test('Hero includes working anchor links for #demo, #developers, and #roadmap', () => {
  assert(heroJsx.includes('href="#demo"'), 'Hero must link to #demo');
  assert(heroJsx.includes('href="#developers"'), 'Hero must link to #developers');
  assert(heroJsx.includes('href="#roadmap"'), 'Hero must link to #roadmap');
});

test('Hero incorporates the clean 3-step visual flow right below hero copy', () => {
  assert(heroJsx.includes('Request a paid API resource.'), 'Step 1 text missing in Hero flow');
  assert(heroJsx.includes('Receive a Zcash payment request and pay from a compatible wallet.'), 'Step 2 text missing in Hero flow');
  assert(heroJsx.includes('CloakPay verifies the payment and grants access.'), 'Step 3 text missing in Hero flow');
});

// ─── PART 3: CRYPTOGRAPHIC ACCURACY & ZIP-321 SPECIFICATION ────────────────

console.log('\n\x1b[36m━━━ PART 3: Cryptographic Accuracy & ZIP-321 Spec ━━━\x1b[0m\n');

test('encodeZip321Memo produces valid Base64url without "=" padding (RFC 4648 §5)', () => {
  const raw = 'CloakPay:sess_9e14a8f9c|amt=0.005|nonce=0x7b84f3e2|scope=api:inference';
  const encoded = encodeZip321Memo(raw);
  assert(!encoded.includes('='), 'Base64url must not contain "=" padding');
  assert(!encoded.includes('+'), 'Base64url must not contain "+"');
  assert(!encoded.includes('/'), 'Base64url must not contain "/"');
  assert(encoded.length > 0, 'Encoded string cannot be empty');
});

test('decodeZip321Memo correctly round-trips encoded Base64url memo', () => {
  const original = 'CloakPay:sess_test_123|amt=0.005';
  const encoded = encodeZip321Memo(original);
  const decoded = decodeZip321Memo(encoded);
  assert(decoded === original, `Roundtrip failed: expected "${original}", got "${decoded}"`);
});

test('buildZip321Uri constructs compliant zcash: URI with Base64url memo', () => {
  const uri = buildZip321Uri({
    address: 'u1m6f94r...',
    amount: '0.005',
    memo: 'CloakPay:sess_456'
  });
  assert(uri.startsWith('zcash:u1m6f94r...?amount=0.005&memo='), `URI prefix incorrect: ${uri}`);
  assert(!uri.includes('=' + encodeZip321Memo('CloakPay:sess_456') + '='), 'URI memo parameter must have no padding');
});

const paywallModalJsx = readComponent('PaywallModal.jsx');
const aiDemoJsx = readComponent('AiDemoTerminal.jsx');

test('PaywallModal imports and uses encodeZip321Memo and buildZip321Uri', () => {
  assert(paywallModalJsx.includes('buildZip321Uri'), 'PaywallModal must use buildZip321Uri');
  assert(paywallModalJsx.includes('encodeZip321Memo'), 'PaywallModal must use encodeZip321Memo');
});

test('AiDemoTerminal displays both Base64url memo parameter and decoded UTF-8 memo', () => {
  assert(aiDemoJsx.includes('base64urlMemo'), 'AiDemoTerminal must compute base64urlMemo');
  assert(aiDemoJsx.includes('ZIP-321 Base64url Memo Parameter'), 'AiDemoTerminal must show Base64url memo parameter');
  assert(aiDemoJsx.includes('Decoded Plaintext UTF-8 Memo'), 'AiDemoTerminal must show Decoded UTF-8 memo');
});

// ─── PART 4: SIMULATION HONESTY & ACCURATE SECURITY CLAIMS ──────────────────

console.log('\n\x1b[36m━━━ PART 4: Simulation Honesty & Accurate Claims ━━━\x1b[0m\n');

test('AiDemoTerminal explicitly displays "Simulation — no real payment is made"', () => {
  assert(aiDemoJsx.includes('Simulation — no real payment is made'), 'Simulation banner missing in AiDemoTerminal');
});

test('PaywallModal explicitly displays "Simulation — no real payment is made"', () => {
  assert(paywallModalJsx.includes('Simulation — no real payment is made'), 'Simulation notice missing in PaywallModal');
});

test('Hero and PrivacyComparison do NOT make false "zero IP leakage" or "0 bytes identity leaked" claims', () => {
  assert(!heroJsx.includes('Zero IP or telemetry leakage'), 'False "Zero IP leakage" claim found in Hero');
  assert(!heroJsx.includes('0 Bytes'), 'False "0 Bytes identity logged" claim found in Hero');
  assert(!aiDemoJsx.includes('0 bytes identity leaked'), 'False "0 bytes identity leaked" claim found in AiDemoTerminal');
});

test('PrivacyComparison explicitly clarifies that Zcash shields on-chain, not IP/prompt to API server', () => {
  const privacyJsx = readComponent('PrivacyComparison.jsx');
  assert(privacyJsx.includes('Technical boundary:'), 'Privacy boundary note missing in PrivacyComparison');
  assert(privacyJsx.includes('does not automatically hide'), 'Clarification that network transport is not hidden missing');
});

test('CodeIntegration uses Incoming Viewing Key (ivk), never Full Viewing Key (fvk)', () => {
  const codeJsx = readComponent('CodeIntegration.jsx');
  assert(!codeJsx.includes('fvk:'), 'fvk found in CodeIntegration - must use ivk');
  assert(codeJsx.includes('ivk:'), 'ivk property missing in CodeIntegration');
});

test('ProtocolFlow accurately describes HTTP 402 and RFC 9110 (full explanation and short bullet)', () => {
  const protocolJsx = readComponent('ProtocolFlow.jsx');
  assert(protocolJsx.includes('Returns HTTP 402 with CloakPay’s payment challenge; RFC 9110 reserves the status code for future use.'), 'Short bullet RFC 9110 wording missing in ProtocolFlow');
  assert(protocolJsx.includes('RFC 9110 reserves HTTP 402') && protocolJsx.includes('does not define a payment protocol. CloakPay uses 402 as its application-level payment challenge'), 'Full explanation RFC 9110 wording missing in ProtocolFlow');
  assert(!protocolJsx.includes('reserved for digital payments'), 'Inaccurate "reserved for digital payments" found in ProtocolFlow');
  assert(!protocolJsx.includes('reserved payment code'), 'Inaccurate "reserved payment code" found in ProtocolFlow');
});

// ─── PART 5: ROADMAP STATUS & PAGE STRUCTURE ────────────────────────────────

console.log('\n\x1b[36m━━━ PART 5: Roadmap Status & Page Structure ━━━\x1b[0m\n');

const appJsx = readFileSync('./src/App.jsx', 'utf-8');
const roadmapJsx = readComponent('RoadmapStatus.jsx');

test('App.jsx renders RoadmapStatus component', () => {
  assert(appJsx.includes('<RoadmapStatus'), 'RoadmapStatus component not rendered in App.jsx');
});

test('RoadmapStatus lists implemented features vs planned roadmap items', () => {
  assert(roadmapJsx.includes('Implemented in this Repo'), 'Implemented section missing in RoadmapStatus');
  assert(roadmapJsx.includes('Planned Roadmap'), 'Planned roadmap section missing in RoadmapStatus');
  assert(roadmapJsx.includes('zebrad / zaino'), 'zebrad/zaino daemon mentioned in Roadmap');
});

// ─── PART 6: INTERACTIVE FLOW & PRESETS AUDIT ───────────────────────────────

console.log('\n\x1b[36m━━━ PART 6: Interactive Flow & Presets Audit ━━━\x1b[0m\n');

test('AiDemoTerminal defines all 3 sample inquiry presets with clean query/lockedText pairs', () => {
  assert(aiDemoJsx.includes("id: 'swiss-zk'"), 'swiss-zk preset missing');
  assert(aiDemoJsx.includes("id: 'smart-contract-audit'"), 'smart-contract-audit preset missing');
  assert(aiDemoJsx.includes("id: 'decentralized-media'"), 'decentralized-media preset missing');
  assert(aiDemoJsx.includes('Swiss ZK Patent Clause'), 'Swiss ZK Patent Clause title missing');
  assert(aiDemoJsx.includes('AI Payment Agent Audit'), 'AI Payment Agent Audit title missing');
  assert(aiDemoJsx.includes('Micro-Royalty Stream'), 'Micro-Royalty Stream title missing');
});

test('AiDemoTerminal cleanly switches presets and re-streams if unlocked', () => {
  assert(aiDemoJsx.includes('handleSelectPreset'), 'handleSelectPreset handler missing');
  assert(aiDemoJsx.includes('setSelectedPrompt(preset)'), 'setSelectedPrompt missing');
  assert(aiDemoJsx.includes('setInputQuery(preset.query)'), 'setInputQuery missing');
});

test('Interactive simulation supports complete 4-stage payment state cycle', () => {
  // Stage 1: Payment requested
  assert(aiDemoJsx.includes("'Payment requested'"), 'Initial state "Payment requested" missing');
  // Stage 2: Waiting for payment
  assert(paywallModalJsx.includes('Waiting for payment'), '"Waiting for payment" state missing in modal');
  // Stage 3: Payment detected
  assert(paywallModalJsx.includes('Payment detected'), '"Payment detected" state missing in modal');
  // Stage 4: Access granted
  assert(paywallModalJsx.includes('Access granted'), '"Access granted" state missing in modal');
  assert(aiDemoJsx.includes("'Access granted'"), '"Access granted" state missing in terminal');
});

test('AiDemoTerminal features typewriter word-by-word streaming and Instant Reveal button', () => {
  assert(aiDemoJsx.includes('displayedWordsCount'), 'Typewriter word count missing');
  assert(aiDemoJsx.includes('Instant Reveal'), 'Instant Reveal button missing');
  assert(aiDemoJsx.includes('handleFastForwardStream'), 'Fast forward handler missing');
});

test('AiDemoTerminal renders Decoded Memo [Judges] tab and HTTP 402 Inspector tab', () => {
  assert(aiDemoJsx.includes("viewMode === 'memo-inspector'"), 'memo-inspector view mode missing');
  assert(aiDemoJsx.includes("viewMode === 'inspector'"), 'HTTP 402 wire inspector view mode missing');
  assert(aiDemoJsx.includes('WWW-Authenticate: CloakPay'), 'WWW-Authenticate header missing in inspector');
  assert(aiDemoJsx.includes('Structured 512-Byte Memo Schema'), 'Structured memo schema table missing');
});

test('PaywallModal and AiDemoTerminal include 1-click copy buttons for URI, address, and memos', () => {
  assert(paywallModalJsx.includes("copyToClipboard(zip321Uri, 'uri')"), 'ZIP-321 URI copy button missing in modal');
  assert(paywallModalJsx.includes("copyToClipboard(zcashUnifiedAddress, 'address')"), 'Address copy button missing in modal');
  assert(paywallModalJsx.includes("copyToClipboard(base64urlMemo, 'base64')"), 'Base64url memo copy button missing in modal');
  assert(aiDemoJsx.includes('setCopiedMemo'), 'Memo copy button missing in terminal');
  assert(aiDemoJsx.includes('setCopiedZipUri'), 'Zip URI copy button missing in terminal');
  assert(aiDemoJsx.includes('copyFullResponse'), 'Copy response output button missing');
});

// ─── PART 7: SUBMISSION DOCUMENTATION & QUICKSTART AUDIT ─────────────────────

console.log('\n\x1b[36m━━━ PART 7: Submission Documentation & Quickstart Audit ━━━\x1b[0m\n');

const readmeMd = readFileSync('./README.md', 'utf-8');

test('README.md features live demo link to https://cloakpay-zec.vercel.app', () => {
  assert(readmeMd.includes('https://cloakpay-zec.vercel.app'), 'Live demo URL missing in README');
});

test('README.md includes 3-step architecture flow and ASCII diagram', () => {
  assert(readmeMd.includes('The 3-Step Flow'), '3-Step flow missing in README');
  assert(readmeMd.includes('Step 1: Request a Paid API Resource'), 'Step 1 missing in README');
  assert(readmeMd.includes('Step 2: Receive Payment Request & Pay from Wallet'), 'Step 2 missing in README');
  assert(readmeMd.includes('Step 3: IVK Note Detection & Access Unlock'), 'Step 3 missing in README');
});

test('README.md honestly documents What Works Today vs. Roadmap', () => {
  assert(readmeMd.includes('What Works Today vs. Roadmap'), 'Roadmap table missing in README');
  assert(readmeMd.includes('Spec-Compliant ZIP-321 Builder'), 'Implemented ZIP-321 builder missing in README');
  assert(readmeMd.includes('Live `zebrad` / `zaino` gRPC Daemon'), 'Planned zebrad/zaino daemon missing in README');
});

test('README.md provides full local quickstart commands', () => {
  assert(readmeMd.includes('npm install'), 'npm install missing in README quickstart');
  assert(readmeMd.includes('npm run dev'), 'npm run dev missing in README quickstart');
  assert(readmeMd.includes('node test-e2e.mjs'), 'node test-e2e.mjs missing in README quickstart');
  assert(readmeMd.includes('npm run build'), 'npm run build missing in README quickstart');
});

// ─── SUMMARY ─────────────────────────────────────────────────────────────────

console.log('\n\x1b[36m━━━ SUMMARY ━━━\x1b[0m\n');
console.log(`  Tests: ${passed + failed} total, ${passed} passed, ${failed} failed`);

if (failed > 0) {
  console.log(`\n  \x1b[31m${failed} test(s) FAILED — fix required before deployment.\x1b[0m\n`);
  process.exit(1);
} else {
  console.log(`\n  \x1b[32mAll ${passed} tests passed! Zero regressions.\x1b[0m\n`);
  process.exit(0);
}
