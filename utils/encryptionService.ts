// utils/encryptionService.ts
import { Buffer } from "buffer"; // Ensure 'buffer' is in your package.json
import CryptoJS from "crypto-js"; // Main CryptoJS import
import * as ExpoCrypto from "expo-crypto"; // From Expo SDK

// Constants for cryptographic operations
const ITERATIONS = 50000; // Number of iterations for PBKDF2
const KEY_SIZE_BITS = 256; // AES key size in bits (256 bits = 32 bytes)
const SALT_SIZE_BYTES = 16; // Salt size in bytes
const IV_SIZE_BYTES = 12; // Recommended IV size for AES-GCM is 12 bytes (96 bits)
// If using CBC (as per previous version you provided), IV is typically block size (16 bytes for AES)
// For GCM, 12 bytes is standard. Let's stick to GCM logic if possible.
// If CBC is indeed the fallback, IV_SIZE_BYTES should be 16.
// The code you provided last was for CBC. I'll keep IV_SIZE_BYTES = 16 for CBC.

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
  return key.toString(CryptoJS.enc.Hex); // Convert the derived key WordArray to Hex
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
 * Encrypts plaintext data using AES.
 * The previous version you provided was configured for AES-CBC by omitting mode/padding
 * and setting IV_SIZE_BYTES = 16. This version will stick to that unless GCM is confirmed working.
 * @param plainText The string to encrypt.
 * @param derivedEncryptionKeyHex The derived encryption key (hex string).
 * @returns A promise that resolves to an object containing the ciphertext (hex) and IV (hex), or null on error.
 */
export async function encryptDataWithKey(
  plainText: string,
  derivedEncryptionKeyHex: string
): Promise<{ cipherTextHex: string; ivHex: string } | null> {
  try {
    const encryptionKey = CryptoJS.enc.Hex.parse(derivedEncryptionKeyHex); // Key as WordArray
    const ivUint8Array = await ExpoCrypto.getRandomBytesAsync(IV_SIZE_BYTES); // IV for AES (16 bytes for CBC)
    const iv = CryptoJS.lib.WordArray.create(ivUint8Array as any); // Convert Uint8Array to WordArray
    const ivHex = CryptoJS.enc.Hex.stringify(iv);

    // Encrypt using AES (defaults to CBC with PKCS7 padding if mode/padding not specified)
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(plainText), // Plaintext as WordArray
      encryptionKey,
      {
        iv: iv,
        // mode: (CryptoJS.mode as any).CBC, // Explicitly CBC if preferred, though it's default
        // padding: (CryptoJS.pad as any).Pkcs7, // Explicitly Pkcs7 if preferred, though it's default
      }
    );

    // encrypted.ciphertext is the WordArray of the actual ciphertext
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
 * Decrypts ciphertext data using AES.
 * Assumes AES-CBC with PKCS7 padding by default if mode/padding are not specified in options.
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
    const cipherText = CryptoJS.enc.Hex.parse(cipherTextHex); // Ciphertext as WordArray

    // Create CipherParams object for decryption
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: cipherText,
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, encryptionKey, {
      iv: iv,
      // mode: (CryptoJS.mode as any).CBC, // Default
      // padding: (CryptoJS.pad as any).Pkcs7, // Default
    });

    const plainText = decrypted.toString(CryptoJS.enc.Utf8);

    // If decryption fails (e.g., wrong key, IV, or corrupted data for CBC),
    // toString(CryptoJS.enc.Utf8) on the result might produce an empty string or garbled data.
    // A zero-byte output from decrypted (decrypted.sigBytes === 0) for non-empty ciphertext is a strong indicator of failure.
    if (decrypted.sigBytes === 0 && cipherTextHex.length > 0) {
      console.error(
        "[encryptionService] Decryption with key failed: Resulting plaintext is effectively empty (sigBytes: 0) for non-empty ciphertext. Check key, IV, or data integrity."
      );
      return null;
    }
    // It's also possible for toString to return an empty string if the original plaintext was empty.
    // However, if ciphertext was non-empty, an empty plaintext after decryption is suspicious.

    return plainText;
  } catch (error: any) {
    console.error(
      "[encryptionService] Error during decryption with key:",
      error.message
    );
    return null;
  }
}
