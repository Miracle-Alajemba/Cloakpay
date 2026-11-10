/**
 * ZIP-321 Payment Request URI helper utilities.
 * Specification: https://zips.z.cash/zip-0321
 *
 * ZIP-321 requires the `memo` parameter to be standard Base64url-encoded
 * without '=' padding (RFC 4648 §5).
 */

/**
 * Encodes a UTF-8 string into standard Base64url without '=' padding.
 * @param {string} text - Plaintext memo (e.g. "CloakPay:sess_9e14a8f9c")
 * @returns {string} Base64url-encoded string
 */
export function encodeZip321Memo(text) {
  if (!text) return '';
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  // Replace '+' with '-', '/' with '_', and strip trailing '=' padding
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decodes a Base64url-encoded memo string back to UTF-8.
 * @param {string} base64url - Base64url string
 * @returns {string} Decoded UTF-8 plaintext
 */
export function decodeZip321Memo(base64url) {
  if (!base64url) return '';
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Builds a ZIP-321 compliant payment request URI.
 * @param {Object} params
 * @param {string} params.address - Zcash Unified Address (u1...)
 * @param {string|number} params.amount - Amount in ZEC
 * @param {string} params.memo - Plaintext memo string (will be base64url encoded)
 * @returns {string} Formatted zcash: URI
 */
export function buildZip321Uri({ address, amount, memo }) {
  const encodedMemo = encodeZip321Memo(memo);
  const params = [];
  if (amount) params.push(`amount=${amount}`);
  if (encodedMemo) params.push(`memo=${encodedMemo}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return `zcash:${address}${query}`;
}
