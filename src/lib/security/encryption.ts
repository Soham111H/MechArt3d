import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  // If running in build or non-server environment, we might not have it.
  // But we want to enforce it at startup in Next.js
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    throw new Error('ENCRYPTION_KEY is required and must be a 64-character hex string');
  }
}

const keyBuffer = ENCRYPTION_KEY ? Buffer.from(ENCRYPTION_KEY, 'hex') : Buffer.alloc(32);
const ALGORITHM = 'aes-256-gcm';

export function encryptField(plaintext: string | null | undefined): string {
  if (!plaintext) return plaintext as any;
  if (plaintext.match(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/)) return plaintext; // already encrypted

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${ciphertext}`;
}

export function decryptField(encrypted: string | null | undefined): string {
  if (!encrypted) return encrypted as any;
  if (!encrypted.match(/^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/)) return encrypted; // not encrypted
  
  try {
    const [ivHex, authTagHex, ciphertext] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
    decipher.setAuthTag(authTag);
    
    let plaintext = decipher.update(ciphertext, 'hex', 'utf8');
    plaintext += decipher.final('utf8');
    
    return plaintext;
  } catch (error) {
    console.error('Decryption failed for field:', error);
    return encrypted; // fallback to encrypted string if it fails
  }
}
