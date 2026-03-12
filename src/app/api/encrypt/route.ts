import { NextRequest, NextResponse } from 'next/server';
import { encryptData, decryptData, generateEncryptionKey, exportKey, importKey, deriveKeyFromPassword, hashData } from '@/lib/encryption';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data, password, salt, encryptedData, iv, keyString } = body;

    switch (action) {
      case 'generateKey': {
        const key = await generateEncryptionKey();
        const exportedKey = await exportKey(key);
        return NextResponse.json({ success: true, key: exportedKey });
      }

      case 'deriveKey': {
        if (!password || !salt) {
          return NextResponse.json({ error: 'Password and salt required' }, { status: 400 });
        }
        const key = await deriveKeyFromPassword(password, salt);
        const exportedKey = await exportKey(key);
        return NextResponse.json({ success: true, key: exportedKey });
      }

      case 'encrypt': {
        if (!data || !keyString) {
          return NextResponse.json({ error: 'Data and key required' }, { status: 400 });
        }
        const key = await importKey(keyString);
        const result = await encryptData(data, key);
        return NextResponse.json({ success: true, ...result });
      }

      case 'decrypt': {
        if (!encryptedData || !iv || !keyString) {
          return NextResponse.json({ error: 'Encrypted data, IV, and key required' }, { status: 400 });
        }
        const key = await importKey(keyString);
        const decrypted = await decryptData(encryptedData, iv, key);
        return NextResponse.json({ success: true, decrypted });
      }

      case 'hash': {
        if (!data) {
          return NextResponse.json({ error: 'Data required' }, { status: 400 });
        }
        const hash = await hashData(data);
        return NextResponse.json({ success: true, hash });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Encryption error:', error);
    return NextResponse.json({ error: 'Encryption operation failed' }, { status: 500 });
  }
}
