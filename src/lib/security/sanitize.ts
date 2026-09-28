/**
 * src/lib/security/sanitize.ts
 * Server-side input sanitization — strips dangerous content before DB writes.
 */

// SQL injection keywords to block in URL params / query strings
const SQL_KEYWORDS = [
  "select ", "insert ", "update ", "delete ", "drop ", "union ", "exec ", "execute ",
  "create ", "alter ", "truncate ", "grant ", "revoke ", "--", ";--", "xp_", "sp_",
  "' or ", "\" or ", "1=1", "or 1=1", "or '1'='1",
];

// Script injection patterns to strip from string inputs
const DANGEROUS_HTML = /<(script|iframe|object|embed|form|meta|link|style)[^>]*>[\s\S]*?<\/\1>/gi;
const HTML_TAGS = /<[^>]+>/g;
const NULL_BYTES = /\0/g;
const EVENT_HANDLERS = /\s*on\w+\s*=/gi;

/**
 * Strip HTML tags and dangerous patterns from a string value.
 * Use before writing user-provided text to the database.
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return input;
  return input
    .replace(NULL_BYTES, "")
    .replace(DANGEROUS_HTML, "")
    .replace(HTML_TAGS, "")
    .replace(EVENT_HANDLERS, "")
    .trim();
}

/**
 * Sanitize all string values in an object (shallow).
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    result[key] = typeof val === "string" ? sanitizeString(val) : val;
  }
  return result as T;
}

/**
 * Check if a URL query param string contains SQL injection patterns.
 * @returns true if suspicious content found (request should be blocked)
 */
export function containsSqlInjection(input: string): boolean {
  const lower = input.toLowerCase();
  return SQL_KEYWORDS.some(kw => lower.includes(kw));
}

/**
 * Check a full URL's search params for SQL injection patterns.
 */
export function urlHasSqlInjection(url: string): boolean {
  try {
    const { searchParams, pathname } = new URL(url);
    const combined = pathname + " " + searchParams.toString();
    return containsSqlInjection(combined);
  } catch {
    return false;
  }
}

/**
 * Validate file MIME type against an allowlist.
 * Never trust the file extension — check the actual content type header.
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const ALLOWED_3D_TYPES = [
  "model/gltf-binary",
  "application/octet-stream", // .stl, .obj
  "application/x-tgif",
];

export const ALL_ALLOWED_UPLOAD_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_3D_TYPES,
];

export function isAllowedMimeType(
  mimeType: string,
  allowed: string[] = ALLOWED_IMAGE_TYPES
): boolean {
  return allowed.includes(mimeType.toLowerCase());
}

/**
 * Truncate a string to a max length — prevents buffer overflow-style attacks.
 */
export function truncate(str: string, maxLen: number): string {
  if (typeof str !== "string") return str;
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}
