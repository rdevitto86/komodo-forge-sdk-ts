import type { JWTPayload, JWTVerifyOptions } from 'jose';
export type { JWTPayload };
export interface SignJWTOptions {
    expiresIn?: string;
    issuer?: string;
    audience?: string | string[];
}
export declare function signJWT(payload: Record<string, unknown>, secret: string, options?: SignJWTOptions): Promise<string>;
export declare function verifyJWT<T extends JWTPayload = JWTPayload>(token: string, secret: string, options?: JWTVerifyOptions): Promise<T>;
/** Decodes a JWT without verifying the signature — use only for inspecting metadata. */
export declare function decodeJWT<T extends JWTPayload = JWTPayload>(token: string): T;
/**
 * Encrypts a string with AES-256-GCM.
 * @param plaintext - UTF-8 string to encrypt.
 * @param keyHex   - 64-character hex string (32 bytes).
 * @returns Colon-delimited hex string: `iv:ciphertext:authTag`
 */
export declare function encryptAES256GCM(plaintext: string, keyHex: string): string;
/**
 * Decrypts a string produced by {@link encryptAES256GCM}.
 * @param encrypted - Colon-delimited hex string: `iv:ciphertext:authTag`
 * @param keyHex    - 64-character hex string (32 bytes).
 */
export declare function decryptAES256GCM(encrypted: string, keyHex: string): string;
/** Generates a random PKCE code verifier (RFC 7636). */
export declare function generatePKCECodeVerifier(): string;
/** Derives the S256 PKCE code challenge from a verifier. */
export declare function generatePKCEChallenge(verifier: string): string;
//# sourceMappingURL=index.d.ts.map