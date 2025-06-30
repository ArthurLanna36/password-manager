// types/vault.ts

/**
 * Represents a password entry as stored and used within the application.
 * This interface is used for data retrieved from Supabase and for local state.
 */
export interface logEntry {
  /** The unique identifier for the password entry (maps to 'password_id' from Supabase). */
  // logId: string;
  /** The ID of the user who owns this password entry (maps to 'user_id' from Supabase). Optional here as it's mainly for DB relation. */
  userId: string;
  credentialId: string;
  deviceId: string;
  /** The name of the service or application for which the password is saved. */
  logDate: string;
  /** The username or email associated with the service (optional). */
  logType: string;
  /** The encrypted password string (ciphertext, stored as hex). */
  ipAddress: string;
  /** The initialization vector (IV) used for encryption/decryption (stored as hex). */
  details: string; // This was missing and caused the error
  /** The ISO string representation of the creation date. */
  locationLat: string;
  /** The ISO string representation of the last update date. */
  locationLon: string;
  validation: boolean;
}