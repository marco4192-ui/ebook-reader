// Web Crypto API encryption utilities for End-to-End Encryption

/**
 * Generate a new encryption key using Web Crypto API
 */
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Export a CryptoKey to a raw key (for storage)
 */
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

/**
 * Import a raw key string back to CryptoKey
 */
export async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(keyString);
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM
 */
export async function encryptData(data: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encoder.encode(data)
  );

  return {
    encrypted: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv),
  };
}

/**
 * Decrypt data using AES-GCM
 */
export async function decryptData(encryptedData: string, iv: string, key: CryptoKey): Promise<string> {
  const decoder = new TextDecoder();
  
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: base64ToArrayBuffer(iv),
    },
    key,
    base64ToArrayBuffer(encryptedData)
  );

  return decoder.decode(decrypted);
}

/**
 * Hash a string using SHA-256
 */
export async function hashData(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return arrayBufferToHex(hashBuffer);
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 32): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  const array = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(array, (byte) => charset[byte % charset.length]).join('');
}

/**
 * Derive a key from a password using PBKDF2
 */
export async function deriveKeyFromPassword(password: string, salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Helper functions
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Privacy settings interface
export interface PrivacySettings {
  encryptionEnabled: boolean;
  encryptedFields: string[];
  autoDeleteAfterDays: number | null;
  lastCleanup: number | null;
  gdprExportRequested: boolean;
  lastGdprExport: number | null;
  localFirstMode: boolean;
  analyticsEnabled: boolean;
  shareUsageData: boolean;
}

export const defaultPrivacySettings: PrivacySettings = {
  encryptionEnabled: false,
  encryptedFields: ['notes', 'highlights'],
  autoDeleteAfterDays: null,
  lastCleanup: null,
  gdprExportRequested: false,
  lastGdprExport: null,
  localFirstMode: true,
  analyticsEnabled: false,
  shareUsageData: false,
};
