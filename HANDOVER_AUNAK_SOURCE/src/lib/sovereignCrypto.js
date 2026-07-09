/**
 * Sovereign AES-256-GCM — shared crypto for sessions, research, and attachments.
 */

export const CRYPTO_FORMAT = "AUNAK-AES256GCM";
export const RESEARCH_CRYPTO_FORMAT = "AUNAK-RESEARCH-AES256GCM";

function bufToHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function bufToBase64(buf) {
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBuf(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importKeyFromSession(user) {
  const seed = String(
    user?.dynamicSessionId ?? user?.childCode ?? user?.activeStudentId ?? "aunak-sovereign"
  );
  const data = new TextEncoder().encode(seed.padEnd(32, "0").slice(0, 32));
  return crypto.subtle.importKey("raw", data, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

/** Encrypt arbitrary text payload — returns JSON string for Airtable storage. */
export async function encryptSessionPayload(plaintext, user, format = CRYPTO_FORMAT) {
  if (plaintext == null || plaintext === "") return "";
  const key = await importKeyFromSession(user);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(String(plaintext));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return JSON.stringify({
    format,
    encryptedAt: new Date().toISOString(),
    iv: bufToBase64(iv),
    ciphertext: bufToBase64(ciphertext),
  });
}

/** Decrypt session payload stored as JSON string. */
export async function decryptSessionPayload(cipherJson, user) {
  if (!cipherJson) return "";
  try {
    const pkg = typeof cipherJson === "string" ? JSON.parse(cipherJson) : cipherJson;
    if (!pkg?.ciphertext || !pkg?.iv) return String(cipherJson);
    const key = await importKeyFromSession(user);
    const iv = base64ToBuf(pkg.iv);
    const ciphertext = base64ToBuf(pkg.ciphertext);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return new TextDecoder().decode(plain);
  } catch {
    return String(cipherJson);
  }
}

/** Encrypt research export with one-time key (original research hub flow). */
export async function encryptForExport(payload) {
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  const rawKey = await crypto.subtle.exportKey("raw", key);

  const fileText = JSON.stringify(
    {
      format: RESEARCH_CRYPTO_FORMAT,
      exportedAt: new Date().toISOString(),
      iv: bufToBase64(iv),
      ciphertext: bufToBase64(ciphertext),
    },
    null,
    2
  );

  return { fileText, keyHex: bufToHex(rawKey) };
}

export { bufToHex, bufToBase64 };
