/**
 * CryptoService - Encryption utilities using Web Crypto API
 * Provides AES-GCM encryption/decryption for secure log storage
 */

export class CryptoService {
    private static ALGORITHM = 'AES-GCM';
    private static KEY_LENGTH = 256;
    private static IV_LENGTH = 12; // 96 bits for GCM

    /**
     * Generate a new encryption key for the session
     */
    static async generateKey(): Promise<CryptoKey> {
        return await crypto.subtle.generateKey(
            {
                name: this.ALGORITHM,
                length: this.KEY_LENGTH
            },
            true, // extractable
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Export key to JWK format for storage
     */
    static async exportKey(key: CryptoKey): Promise<JsonWebKey> {
        return await crypto.subtle.exportKey('jwk', key);
    }

    /**
     * Import key from JWK format
     */
    static async importKey(jwk: JsonWebKey): Promise<CryptoKey> {
        return await crypto.subtle.importKey(
            'jwk',
            jwk,
            {
                name: this.ALGORITHM,
                length: this.KEY_LENGTH
            },
            true,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Encrypt data with AES-GCM
     */
    static async encrypt(data: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }> {
        // Generate random IV
        const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

        // Convert string to ArrayBuffer
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);

        // Encrypt
        const encryptedBuffer = await crypto.subtle.encrypt(
            {
                name: this.ALGORITHM,
                iv: iv
            },
            key,
            dataBuffer
        );

        // Convert to base64 for storage
        return {
            encrypted: this.arrayBufferToBase64(encryptedBuffer),
            iv: this.arrayBufferToBase64(iv)
        };
    }

    /**
     * Decrypt data with AES-GCM
     */
    static async decrypt(encryptedData: string, ivBase64: string, key: CryptoKey): Promise<string> {
        try {
            const encryptedBuffer = this.base64ToArrayBuffer(encryptedData);
            const iv = this.base64ToArrayBuffer(ivBase64);

            const decryptedBuffer = await crypto.subtle.decrypt(
                {
                    name: this.ALGORITHM,
                    iv: new Uint8Array(iv)
                },
                key,
                encryptedBuffer
            );

            const decoder = new TextDecoder();
            return decoder.decode(decryptedBuffer);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Generate SHA-256 hash for integrity checking
     */
    static async hash(data: string): Promise<string> {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        return this.arrayBufferToBase64(hashBuffer);
    }

    /**
     * Anonymize sensitive data (email, ID) by hashing
     */
    static async anonymize(data: string): Promise<string> {
        const hash = await this.hash(data);
        return hash.substring(0, 16); // First 16 chars of hash
    }

    // Helper methods for base64 conversion
    private static arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    private static base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }
}
