/**
 * Data encryption utilities for sensitive information storage
 * Uses Web Crypto API for client-side encryption
 */

/**
 * Generate a cryptographic key for encryption/decryption
 */
async function generateKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Derive a key from a password using PBKDF2
 */
async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM
 */
async function encryptData(
  data: string,
  key: CryptoKey
): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    encoder.encode(data)
  );

  return { encrypted, iv };
}

/**
 * Decrypt data using AES-GCM
 */
async function decryptData(
  encryptedData: ArrayBuffer,
  key: CryptoKey,
  iv: Uint8Array
): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource,
    },
    key,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encryption service class
 */
export class EncryptionService {
  private static key: CryptoKey | null = null;
  private static readonly STORAGE_KEY = 'leadgen_encryption_key';
  private static readonly SALT_KEY = 'leadgen_salt';

  /**
   * Initialize encryption service
   */
  static async initialize(password?: string): Promise<void> {
    try {
      if (password) {
        // Use password-based encryption
        let salt = this.getSaltFromStorage();
        if (!salt) {
          salt = crypto.getRandomValues(new Uint8Array(16));
          this.storeSalt(salt);
        }
        
        this.key = await deriveKeyFromPassword(password, salt);
      } else {
        // Use stored key or generate new one
        const storedKey = await this.getKeyFromStorage();
        if (storedKey) {
          this.key = storedKey;
        } else {
          this.key = await generateKey();
          await this.storeKey(this.key);
        }
      }
    } catch (error) {
      console.error('Error initializing encryption service:', error);
      throw new Error('Failed to initialize encryption');
    }
  }

  /**
   * Encrypt sensitive data
   */
  static async encrypt(data: string): Promise<string> {
    if (!this.key) {
      await this.initialize();
    }

    try {
      const { encrypted, iv } = await encryptData(data, this.key!);
      
      // Combine IV and encrypted data
      const combined = {
        iv: arrayBufferToBase64(iv.buffer as ArrayBuffer),
        data: arrayBufferToBase64(encrypted),
      };

      return btoa(JSON.stringify(combined));
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static async decrypt(encryptedData: string): Promise<string> {
    if (!this.key) {
      await this.initialize();
    }

    try {
      const combined = JSON.parse(atob(encryptedData));
      const iv = new Uint8Array(base64ToArrayBuffer(combined.iv));
      const encrypted = base64ToArrayBuffer(combined.data);

      return await decryptData(encrypted, this.key!, iv);
    } catch (error) {
      console.error('Error decrypting data:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Check if encryption is available
   */
  static isAvailable(): boolean {
    return (
      typeof crypto !== 'undefined' &&
      typeof crypto.subtle !== 'undefined' &&
      typeof crypto.getRandomValues !== 'undefined'
    );
  }

  /**
   * Store encryption key in localStorage (for development only)
   */
  private static async storeKey(key: CryptoKey): Promise<void> {
    if (typeof localStorage === 'undefined') return;

    try {
      const exported = await crypto.subtle.exportKey('jwk', key);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(exported));
    } catch (_error) {
      console.error('Error storing encryption key:', _error);
    }
  }

  /**
   * Get encryption key from localStorage
   */
  private static async getKeyFromStorage(): Promise<CryptoKey | null> {
    if (typeof localStorage === 'undefined') return null;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const keyData = JSON.parse(stored);
      return await crypto.subtle.importKey(
        'jwk',
        keyData,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (_error) {
      console.error('Error getting encryption key from storage:', _error);
      return null;
    }
  }

  /**
   * Store salt in localStorage
   */
  private static storeSalt(salt: Uint8Array): void {
    if (typeof localStorage === 'undefined') return;

    try {
      const saltBase64 = arrayBufferToBase64(salt.buffer as ArrayBuffer);
      localStorage.setItem(this.SALT_KEY, saltBase64);
    } catch (_error) {
      console.error('Error storing salt:', _error);
    }
  }

  /**
   * Get salt from localStorage
   */
  private static getSaltFromStorage(): Uint8Array | null {
    if (typeof localStorage === 'undefined') return null;

    try {
      const stored = localStorage.getItem(this.SALT_KEY);
      if (!stored) return null;

      return new Uint8Array(base64ToArrayBuffer(stored));
    } catch (_error) {
      console.error('Error getting salt from storage:', _error);
      return null;
    }
  }

  /**
   * Clear stored encryption data
   */
  static clearStoredData(): void {
    if (typeof localStorage === 'undefined') return;

    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.SALT_KEY);
      this.key = null;
    } catch (error) {
      console.error('Error clearing encryption data:', error);
    }
  }

  /**
   * Hash sensitive data (one-way)
   */
  static async hash(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      return arrayBufferToBase64(hashBuffer);
    } catch (error) {
      console.error('Error hashing data:', error);
      throw new Error('Failed to hash data');
    }
  }
}

/**
 * Utility functions for common encryption tasks
 */

/**
 * Encrypt phone number for storage
 */
export async function encryptPhoneNumber(phone: string): Promise<string> {
  if (!EncryptionService.isAvailable()) {
    return phone; // Fallback to plain text if encryption not available
  }
  
  try {
    return await EncryptionService.encrypt(phone);
  } catch {
    console.warn('Failed to encrypt phone number, storing as plain text');
    return phone;
  }
}

/**
 * Decrypt phone number from storage
 */
export async function decryptPhoneNumber(encryptedPhone: string): Promise<string> {
  if (!EncryptionService.isAvailable()) {
    return encryptedPhone; // Assume plain text if encryption not available
  }

  try {
    return await EncryptionService.decrypt(encryptedPhone);
  } catch {
    console.warn('Failed to decrypt phone number, assuming plain text');
    return encryptedPhone;
  }
}

/**
 * Check if data appears to be encrypted
 */
export function isEncrypted(data: string): boolean {
  try {
    // Check if it's base64 encoded JSON with iv and data properties
    const decoded = JSON.parse(atob(data));
    return typeof decoded.iv === 'string' && typeof decoded.data === 'string';
  } catch {
    return false;
  }
}