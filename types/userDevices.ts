// types/vault.ts

/**
 * Represents a password entry as stored and used within the application.
 * This interface is used for data retrieved from Supabase and for local state.
 */
export interface devicesEntry {
  /** The unique identifier for the password entry (maps to 'password_id' from Supabase). */
  // logId: string;
  /** The ID of the user who owns this passwodededrd entry (maps to 'user_id' from Supabase). Optional here as it's mainly for DB relation. */
  deviceId: string;
  name: string;
  last_sync: string;
  /** The name of the service or application for which the password is saved. */
  active: boolean;
  created_at: string;
  /** The username or email associated with the service (optional). */
  user_id: string;
  
}