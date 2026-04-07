import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { SignJWT, decodeJwt, jwtVerify } from 'jose';
import type { JWTPayload, JWTVerifyOptions } from 'jose';

export type { JWTPayload };

// --- JWT ---

const encoder = new TextEncoder();

export interface SignJWTOptions {
  expiresIn?: string;
  issuer?: string;
  audience?: string | string[];
}

export async function signJWT(payload: Record<string, unknown>, secret: string, options?: SignJWTOptions): Promise<string> {
  let builder = new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt();

  if (options?.expiresIn !== undefined) builder = builder.setExpirationTime(options.expiresIn);
  if (options?.issuer !== undefined) builder = builder.setIssuer(options.issuer);
  if (options?.audience !== undefined) builder = builder.setAudience(options.audience);

  return builder.sign(encoder.encode(secret));
}

export async function verifyJWT<T extends JWTPayload = JWTPayload>(token: string, secret: string, options?: JWTVerifyOptions): Promise<T> {
  return (await jwtVerify<T>(token, encoder.encode(secret), options)).payload;
}

/** Decodes a JWT without verifying the signature — use only for inspecting metadata. */
export function decodeJWT<T extends JWTPayload = JWTPayload>(token: string): T {
  return decodeJwt<T>(token);
}

// --- AES-256-GCM ---

const IV_BYTES = 12;
const TAG_BYTES = 16;

/**
 * Encrypts a string with AES-256-GCM.
 * @param plaintext - UTF-8 string to encrypt.
 * @param keyHex   - 64-character hex string (32 bytes).
 * @returns Colon-delimited hex string: `iv:ciphertext:authTag`
 */
export function encryptAES256GCM(plaintext: string, keyHex: string): string {
  const key = Buffer.from(keyHex, 'hex');
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, iv, { authTagLength: TAG_BYTES });
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${encrypted.toString('hex')}:${tag.toString('hex')}`;
}

/**
 * Decrypts a string produced by {@link encryptAES256GCM}.
 * @param encrypted - Colon-delimited hex string: `iv:ciphertext:authTag`
 * @param keyHex    - 64-character hex string (32 bytes).
 */
export function decryptAES256GCM(encrypted: string, keyHex: string): string {
  const parts = encrypted.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format — expected "iv:ciphertext:authTag"');
  }

  const [ivHex, ciphertextHex, tagHex] = parts as [string, string, string];
  const key = Buffer.from(keyHex, 'hex');
  const decipher = createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(ivHex, 'hex'),
    { authTagLength: TAG_BYTES },
  );

  decipher.setAuthTag(Buffer.from(tagHex, 'hex'));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextHex, 'hex')),
    decipher.final(),
  ]).toString('utf8');
}

// --- PKCE ---

/** Generates a random PKCE code verifier (RFC 7636). */
export const generatePKCECodeVerifier = (): string => randomBytes(32).toString('base64url');

/** Derives the S256 PKCE code challenge from a verifier. */
export const generatePKCEChallenge = (verifier: string): string => createHash('sha256').update(verifier).digest('base64url');

