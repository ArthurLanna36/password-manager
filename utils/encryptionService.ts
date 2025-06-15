// utils/encryptionService.ts
import { Buffer } from "buffer";
import CryptoJS from "crypto-js";
import * as ExpoCrypto from "expo-crypto";

// Constants for cryptographic operations
const ITERATIONS = 50000;
const KEY_SIZE_BITS = 256;
const SALT_SIZE_BYTES = 16;
// This implementation uses AES-CBC, which requires an IV size equal to the block size (16 bytes for AES).
// For AES-GCM, the recommended IV size is 12 bytes (96 bits).
const IV_SIZE_BYTES = 16;

/**
 * Derives a cryptographic key from a master password and a salt using PBKDF2.
 * @param masterPassword The user's master password.
 * @param saltHex The salt for this user, as a hexadecimal string.
 * @returns A promise that resolves to the derived key as a hexadecimal string.
 */
export async function deriveKeyFromMasterPassword(
  masterPassword: string,
  saltHex: string
): Promise<string> {
  const salt = CryptoJS.enc.Hex.parse(saltHex);

  // Runtime check to ensure SHA256 algorithm is available on CryptoJS
  if (!CryptoJS.algo || !CryptoJS.algo.SHA256) {
    const errorMessage =
      "CryptoJS.algo.SHA256 is not available! Check crypto-js import/installation.";
    console.error(`[encryptionService] ${errorMessage}`);
    throw new Error(errorMessage);
  }

  const key = CryptoJS.PBKDF2(masterPassword, salt, {
    keySize: KEY_SIZE_BITS / 32, // keySize is in 32-bit words (e.g., 256/32 = 8)
    iterations: ITERATIONS,
    hasher: CryptoJS.algo.SHA256,
  });
  return key.toString(CryptoJS.enc.Hex);
}

/**
 * Generates a cryptographically secure random salt.
 * @returns A promise that resolves to the salt as a hexadecimal string.
 */
export async function generateSalt(): Promise<string> {
  const randomBytes = await ExpoCrypto.getRandomBytesAsync(SALT_SIZE_BYTES);
  return Buffer.from(randomBytes).toString("hex");
}

/**
 * Encrypts plaintext data using AES-CBC with PKCS7 padding.
 * @param plainText The string to encrypt.
 * @param derivedEncryptionKeyHex The derived encryption key (hex string).
 * @returns A promise that resolves to an object containing the ciphertext (hex) and IV (hex), or null on error.
 */
export async function encryptDataWithKey(
  plainText: string,
  derivedEncryptionKeyHex: string
): Promise<{ cipherTextHex: string; ivHex: string } | null> {
  try {
    const encryptionKey = CryptoJS.enc.Hex.parse(derivedEncryptionKeyHex);
    const ivUint8Array = await ExpoCrypto.getRandomBytesAsync(IV_SIZE_BYTES);
    const iv = CryptoJS.lib.WordArray.create(ivUint8Array as any);
    const ivHex = CryptoJS.enc.Hex.stringify(iv);

    // Encrypt using AES (defaults to CBC with PKCS7 padding)
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(plainText),
      encryptionKey,
      {
        iv: iv,
      }
    );

    const cipherTextHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    return { cipherTextHex, ivHex };
  } catch (error) {
    console.error(
      "[encryptionService] Error during encryption with key:",
      error
    );
    return null;
  }
}

/**
 * Decrypts ciphertext data using AES-CBC with PKCS7 padding.
 * @param cipherTextHex The ciphertext to decrypt (hex string).
 * @param ivHex The initialization vector used for encryption (hex string).
 * @param derivedEncryptionKeyHex The derived encryption key (hex string).
 * @returns A promise that resolves to the decrypted plaintext string, or null on error.
 */
export async function decryptDataWithKey(
  cipherTextHex: string,
  ivHex: string,
  derivedEncryptionKeyHex: string
): Promise<string | null> {
  try {
    const encryptionKey = CryptoJS.enc.Hex.parse(derivedEncryptionKeyHex);
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const cipherText = CryptoJS.enc.Hex.parse(cipherTextHex);

    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: cipherText,
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, encryptionKey, {
      iv: iv,
    });

    const plainText = decrypted.toString(CryptoJS.enc.Utf8);

    // A zero-byte output from decrypted (decrypted.sigBytes === 0) for non-empty ciphertext
    // is a strong indicator of decryption failure (e.g., wrong key or IV).
    if (decrypted.sigBytes === 0 && cipherTextHex.length > 0) {
      console.error(
        "[encryptionService] Decryption failed: Result is empty for non-empty ciphertext."
      );
      return null;
    }

    return plainText;
  } catch (error: any) {
    console.error(
      "[encryptionService] Error during decryption with key:",
      error.message
    );
    return null;
  }
}
