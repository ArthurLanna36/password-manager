// hooks/useVaultStatus.ts
import { supabase } from "@/constants/supabase";
import {
  decryptDataWithKey,
  deriveKeyFromMasterPassword,
  encryptDataWithKey,
  generateSalt,
} from "@/utils/encryptionService";
import { User } from "@supabase/supabase-js";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { Alert } from "react-native";

// Constants
const PROFILES_TABLE_NAME = "user_profiles";
const VERIFICATION_STRING = "vault_ok_check";

interface UserProfile {
  encryption_salt: string | null;
  master_password_verify_cipher: string | null;
  master_password_verify_iv: string | null;
}

interface VaultStatus {
  userSalt: string | null;
  setUserSalt: Dispatch<SetStateAction<string | null>>;
  derivedEncryptionKey: string | null;
  setDerivedEncryptionKey: Dispatch<SetStateAction<string | null>>;
  isVaultLocked: boolean;
  setIsVaultLocked: Dispatch<SetStateAction<boolean>>;
  needsVaultSetup: boolean;
  setNeedsVaultSetup: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  checkVaultStatusInternal: () => Promise<void>;
  handleMasterPasswordSubmit: (password: string) => Promise<boolean>; // Returns true on success, false on failure
  masterPasswordInput: string;
  setMasterPasswordInput: Dispatch<SetStateAction<string>>;
  setupMasterPassword: string;
  setSetupMasterPassword: Dispatch<SetStateAction<string>>;
  confirmSetupMasterPassword: string;
  setConfirmSetupMasterPassword: Dispatch<SetStateAction<string>>;
  currentUser: User | null;
}

export function useVaultStatus(): VaultStatus {
  const [userSalt, setUserSalt] = useState<string | null>(null);
  const [derivedEncryptionKey, setDerivedEncryptionKey] = useState<
    string | null
  >(null);
  const [isVaultLocked, setIsVaultLocked] = useState(true);
  const [needsVaultSetup, setNeedsVaultSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [masterPasswordInput, setMasterPasswordInput] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [setupMasterPassword, setSetupMasterPassword] = useState("");
  const [confirmSetupMasterPassword, setConfirmSetupMasterPassword] =
    useState("");

  const fetchUserProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      console.log(`[useVaultStatus] Fetching profile for user: ${userId}`);
      const { data, error } = await supabase
        .from(PROFILES_TABLE_NAME)
        .select(
          "encryption_salt, master_password_verify_cipher, master_password_verify_iv"
        )
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error(
          "[useVaultStatus] Error fetching user profile:",
          error.message
        );
        Alert.alert("Profile Error", "Could not load your profile data.");
        return null;
      }
      return data as UserProfile | null;
    },
    []
  );

  const checkVaultStatusInternal = useCallback(async () => {
    console.log("[useVaultStatus] checkVaultStatusInternal called.");
    setIsLoading(true);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (authError || !user) {
      setIsVaultLocked(true);
      setNeedsVaultSetup(false);
      setDerivedEncryptionKey(null);
      setIsLoading(false);
      return;
    }

    const profile = await fetchUserProfile(user.id);
    if (profile && profile.encryption_salt) {
      setUserSalt(profile.encryption_salt);
      setNeedsVaultSetup(false);
      setIsVaultLocked(!derivedEncryptionKey); // Lock if no key, unlock if key exists
    } else {
      setNeedsVaultSetup(true);
      setIsVaultLocked(true);
      setDerivedEncryptionKey(null);
    }
    setIsLoading(false);
  }, [fetchUserProfile, derivedEncryptionKey]);

  const handleMasterPasswordSubmit = async (
    passwordToProcess: string
  ): Promise<boolean> => {
    if (!currentUser) {
      Alert.alert("Error", "User session not found.");
      return false;
    }
    setIsLoading(true);

    if (needsVaultSetup) {
      if (setupMasterPassword !== confirmSetupMasterPassword) {
        Alert.alert("Error", "Master passwords do not match.");
        setIsLoading(false);
        return false;
      }
      if (setupMasterPassword.length < 8) {
        Alert.alert("Error", "Master password must be at least 8 characters.");
        setIsLoading(false);
        return false;
      }
      try {
        const newSalt = await generateSalt();
        // Use `setupMasterPassword` for setup
        const newDerivedKey = await deriveKeyFromMasterPassword(
          setupMasterPassword,
          newSalt
        );
        const encryptedVerification = await encryptDataWithKey(
          VERIFICATION_STRING,
          newDerivedKey
        );
        if (!encryptedVerification)
          throw new Error("Failed to encrypt verification data.");

        const { error: profileError } = await supabase
          .from(PROFILES_TABLE_NAME)
          .upsert(
            {
              id: currentUser.id,
              encryption_salt: newSalt,
              master_password_verify_cipher:
                encryptedVerification.cipherTextHex,
              master_password_verify_iv: encryptedVerification.ivHex,
            },
            { onConflict: "id" }
          );
        if (profileError) throw profileError;

        setUserSalt(newSalt);
        setDerivedEncryptionKey(newDerivedKey);
        setNeedsVaultSetup(false);
        setIsVaultLocked(false);
        setSetupMasterPassword("");
        setConfirmSetupMasterPassword("");
        setMasterPasswordInput("");
        Alert.alert("Success", "Vault configured and unlocked!");
        setIsLoading(false);
        return true;
      } catch (error: any) {
        console.error(
          "[useVaultStatus] Error setting up vault:",
          error.message
        );
        Alert.alert("Setup Error", error.message);
        setIsLoading(false);
        return false;
      }
    } else if (isVaultLocked && userSalt) {
      // Use `passwordToProcess` (which is masterPasswordInput from VaultUnlockView) for unlocking
      if (!passwordToProcess.trim()) {
        Alert.alert("Error", "Please enter your master password.");
        setIsLoading(false);
        return false;
      }
      try {
        const key = await deriveKeyFromMasterPassword(
          passwordToProcess,
          userSalt
        );
        const profile = await fetchUserProfile(currentUser.id);

        if (
          profile &&
          profile.master_password_verify_cipher &&
          profile.master_password_verify_iv
        ) {
          const decryptedVerification = await decryptDataWithKey(
            profile.master_password_verify_cipher,
            profile.master_password_verify_iv,
            key
          );
          if (decryptedVerification === VERIFICATION_STRING) {
            setDerivedEncryptionKey(key);
            setIsVaultLocked(false);
            setMasterPasswordInput("");
            Alert.alert("Success", "Vault Unlocked!");
            setIsLoading(false);
            return true;
          } else {
            Alert.alert("Unlock Failed", "Incorrect master password.");
            setDerivedEncryptionKey(null);
          }
        } else {
          Alert.alert(
            "Configuration Error",
            "User profile or verification data not found."
          );
          setNeedsVaultSetup(true);
          setDerivedEncryptionKey(null);
        }
      } catch (error: any) {
        console.error("[useVaultStatus] Error unlocking vault:", error.message);
        Alert.alert("Unlock Error", "Failed to unlock the vault.");
        setDerivedEncryptionKey(null);
      }
    }
    setIsLoading(false);
    return false;
  };

  return {
    userSalt,
    setUserSalt,
    derivedEncryptionKey,
    setDerivedEncryptionKey,
    isVaultLocked,
    setIsVaultLocked,
    needsVaultSetup,
    setNeedsVaultSetup,
    isLoading,
    setIsLoading,
    checkVaultStatusInternal,
    handleMasterPasswordSubmit,
    masterPasswordInput,
    setMasterPasswordInput,
    setupMasterPassword,
    setSetupMasterPassword,
    confirmSetupMasterPassword,
    setConfirmSetupMasterPassword,
    currentUser,
  };
}
