// types/vault.ts

/**
 * Represents a password entry as stored and used within the application.
 * This interface is used for data retrieved from Supabase and for local state.
 */
export interface PasswordEntry {
  /** The unique identifier for the password entry (maps to 'password_id' from Supabase). */
  id: string;
  /** The ID of the user who owns this password entry (maps to 'user_id' from Supabase). Optional here as it's mainly for DB relation. */
  userId?: string;
  /** The name of the service or application for which the password is saved. */
  serviceName: string;
  /** The username or email associated with the service (optional). */
  username?: string;
  /** The encrypted password string (ciphertext, stored as hex). */
  passwordEncrypted: string;
  /** The initialization vector (IV) used for encryption/decryption (stored as hex). */
  iv: string; // This was missing and caused the error
  /** The ISO string representation of the creation date. */
  createdAt: string;
  /** The ISO string representation of the last update date. */
  updatedAt: string;
  /** The website URL for the service (optional). */
  website?: string;
}

/**
 * Represents the data structure for the form when adding or editing a password.
 * The password here is in plaintext before encryption.
 */
export type PasswordFormData = {
  /** The name of the service or application. */
  serviceName: string;
  /** The username or email for the service (optional). */
  username?: string;
  /** The password in plaintext, as entered by the user in the form. */
  passwordPlain: string;
  /** The website URL for the service (optional). */
  website?: string;
};

/**
 * Represents the payload for editing an existing password entry.
 * It includes all fields from PasswordFormData and the ID of the entry being edited.
 * (This type is not strictly causing the current error but is good for clarity in edit operations).
 */
export type EditPasswordPayload = PasswordFormData & {
  /** The unique identifier of the password entry being edited. */
  id: string;
};
