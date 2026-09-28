/**
 * src/lib/security/encrypt.ts
 * AES-256-GCM column-level encryption for PII fields (phone, address, etc.)
 * Uses Node.js built-in crypto — no external dependency needed.
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY_LENGTH = 32; // bytes → 256 bits
const IV_LENGTH  = 12; // bytes → 96 bits (recommended for GCM)
const TAG_LENGTH = 16; // bytes → 128 bits (GCM auth tag)

/** Derive a fixed 32-byte key from the environment secret */
function getDerivedKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY;
  if (!secret) {
    // In development, use a dummy key — NEVER do this in production
    if (process.env.NODE_ENV === "development") {
      return Buffer.alloc(KEY_LENGTH, "dev-key-mechart3d-placeholder!!!");
    }
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  // Derive from password using scrypt (salt pinned to app name for determinism)
  return scryptSync(secret, "mechart3d-salt-v1", KEY_LENGTH) as Buffer;
}

/**
 * Encrypt a plaintext string.
 * Returns a base64-encoded string: IV + AuthTag + CipherText
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext;

  const key = getDerivedKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  // Pack: iv (12) + tag (16) + ciphertext
  const packed = Buffer.concat([iv, tag, encrypted]);
  return packed.toString("base64");
}

/**
 * Decrypt a previously encrypted value.
 * Returns the original plaintext, or empty string if decryption fails.
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) return ciphertext;

  try {
    const key = getDerivedKey();
    const packed = Buffer.from(ciphertext, "base64");

    const iv  = packed.subarray(0, IV_LENGTH);
    const tag = packed.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const enc = packed.subarray(IV_LENGTH + TAG_LENGTH);

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(enc).toString("utf8") + decipher.final("utf8");
  } catch {
    // Return empty string if decryption fails (don't crash the app)
    console.error("[encrypt] Decryption failed — data may be corrupted or key changed");
    return "";
  }
}

/**
 * Conditionally encrypt — only if encryption is enabled.
 * In development with no key set, returns plaintext (for easier debugging).
 */
export function maybeEncrypt(value: string): string {
  if (!process.env.ENCRYPTION_KEY && process.env.NODE_ENV === "development") {
    return value; // Skip encryption in dev if no key set
  }
  return encrypt(value);
}

export function maybeDecrypt(value: string): string {
  if (!process.env.ENCRYPTION_KEY && process.env.NODE_ENV === "development") {
    return value;
  }
  return decrypt(value);
}
