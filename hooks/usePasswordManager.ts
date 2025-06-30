// hooks/usePasswordManager.ts
import { supabase } from "@/constants/supabase";
import { PasswordEntry, PasswordFormData } from "@/types/vault";
import { logAuditEvent } from '@/utils/auditLogService';
import {
  decryptDataWithKey,
  encryptDataWithKey,
} from "@/utils/encryptionService";
import { User } from "@supabase/supabase-js";
import * as Clipboard from "expo-clipboard";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";

const VAULT_TABLE_NAME = "vault_passwords";
const VAULT_PK_COLUMN = "password_id";

interface UsePasswordManagerProps {
  currentUser: User | null;
  derivedEncryptionKey: string | null;
  isVaultLocked: boolean;
  setScreenLoading: Dispatch<SetStateAction<boolean>>;
}

interface PasswordManager {
  passwords: PasswordEntry[];
  fetchPasswords: (isRefresh?: boolean) => Promise<void>;
  handleModalSubmit: (
    formData: PasswordFormData,
    editingPassword: PasswordEntry | null
  ) => Promise<boolean>;
  handleDeletePassword: (itemToDelete: PasswordEntry) => Promise<void>;
  showPasswordId: string | null;
  revealedPassword: string | null;
  handleTogglePasswordVisibility: (item: PasswordEntry) => Promise<void>;
  copyToClipboard: (text: string) => Promise<void>;
  isPasswordLoading: boolean;
  isRefreshingPasswords: boolean;
}

export function usePasswordManager({
  currentUser,
  derivedEncryptionKey,
  isVaultLocked,
  setScreenLoading,
}: UsePasswordManagerProps): PasswordManager {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isRefreshingPasswords, setIsRefreshingPasswords] = useState(false);
  const [showPasswordId, setShowPasswordId] = useState<string | null>(null);
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const revealTimeoutRef = useRef<number | null>(null);

  const fetchPasswords = useCallback(
    async (isRefresh = false) => {
      if (isVaultLocked || !derivedEncryptionKey) {
        setPasswords([]);
        if (isRefresh) setIsRefreshingPasswords(false);
        else setIsPasswordLoading(false);
        return;
      }

      if (isRefresh) setIsRefreshingPasswords(true);
      else setIsPasswordLoading(true);
      setScreenLoading(true);

      try {
        if (!currentUser) throw new Error("User not authenticated.");
        const { data, error: dbError } = await supabase
          .from(VAULT_TABLE_NAME)
          .select(
            `${VAULT_PK_COLUMN}, user_id, service_name, username, encrypted_password, iv, created_at, updated_at, website`
          )
          .eq("user_id", currentUser.id)
          .order("service_name", { ascending: true });

        if (dbError) throw dbError;
        setPasswords(
          data?.map((item: any) => ({
            id: item[VAULT_PK_COLUMN],
            userId: item.user_id,
            serviceName: item.service_name,
            username: item.username,
            passwordEncrypted: item.encrypted_password,
            iv: item.iv,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            website: item.website,
          })) || []
        );
      } catch (error: any) {
        Alert.alert("Error Loading Passwords", error.message);
        setPasswords([]);
      } finally {
        if (isRefresh) setIsRefreshingPasswords(false);
        else setIsPasswordLoading(false);
        setScreenLoading(false);
      }
    },
    [isVaultLocked, derivedEncryptionKey, currentUser, setScreenLoading]
  );

  const handleModalSubmit = async (
    formData: PasswordFormData,
    editingPassword: PasswordEntry | null
  ): Promise<boolean> => {
    if (isVaultLocked || !derivedEncryptionKey || !currentUser) {
      Alert.alert("Error", "Vault is locked or user session is invalid.");
      return false;
    }
    setScreenLoading(true);

    if (!formData.passwordPlain && !editingPassword) {
      Alert.alert(
        "Validation Error",
        "Password cannot be empty for new entries."
      );
      setScreenLoading(false);
      return false;
    }

    let cipherTextHex = editingPassword?.passwordEncrypted;
    let ivHex = editingPassword?.iv;

    if (formData.passwordPlain) {
      const encryptedResult = await encryptDataWithKey(
        formData.passwordPlain,
        derivedEncryptionKey
      );
      if (!encryptedResult) {
        Alert.alert("Encryption Error", "Could not encrypt password data.");
        setScreenLoading(false);
        return false;
      }
      cipherTextHex = encryptedResult.cipherTextHex;
      ivHex = encryptedResult.ivHex;
    } else if (editingPassword && !formData.passwordPlain) {
      // Keep old if editing and password field is empty
      cipherTextHex = editingPassword.passwordEncrypted;
      ivHex = editingPassword.iv;
    }

    // This check is critical before insert if it's a new entry and password wasn't provided
    // (though the initial check `!formData.passwordPlain && !editingPassword` should cover new entries)
    if (!cipherTextHex || !ivHex) {
      Alert.alert(
        "Internal Error",
        "Encryption data (cipherTextHex or ivHex) is missing."
      );
      setScreenLoading(false);
      return false;
    }

    try {
      if (editingPassword && editingPassword.id) {
        const { error } = await supabase
          .from(VAULT_TABLE_NAME)
          .update({
            service_name: formData.serviceName,
            username: formData.username || null,
            website: formData.website || null,
            encrypted_password: cipherTextHex,
            iv: ivHex,
            updated_at: new Date().toISOString(),
          })
          .eq(VAULT_PK_COLUMN, editingPassword.id)
          .eq("user_id", currentUser.id);
        if (error) throw error;
        Alert.alert("Success", "Password updated!");
        logAuditEvent('PASSWORD_UPDATED', currentUser, { credential_id: editingPassword.id });
      } else {
        const { error } = await supabase.from(VAULT_TABLE_NAME).insert([
          {
            user_id: currentUser.id,
            service_name: formData.serviceName,
            username: formData.username || null,
            website: formData.website || null,
            encrypted_password: cipherTextHex, // Ensure this is not undefined
            iv: ivHex, // Ensure this is not undefined
          },
        ]);
        if (error) throw error;
        Alert.alert("Success", "Password added!");
        logAuditEvent('PASSWORD_CREATED', currentUser, { details: `Service: ${formData.serviceName}` });
      }
      await fetchPasswords();
      setScreenLoading(false);
      return true;
    } catch (error: any) {
      Alert.alert("Save Error", error.message);
      setScreenLoading(false);
      return false;
    }

    
  };

  const handleDeletePassword = async (itemToDelete: PasswordEntry) => {
    if (isVaultLocked || !derivedEncryptionKey || !currentUser) {
      Alert.alert("Error", "Vault is locked or user session is invalid.");
      return;
    }
    Alert.alert(
      "Delete Password",
      `Delete password for "${itemToDelete.serviceName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setScreenLoading(true);
            logAuditEvent('PASSWORD_DELETED', currentUser, { 
              details: `Deletion of credential id ${itemToDelete.id}` 
            });
            const { error } = await supabase
              .from(VAULT_TABLE_NAME)
              .delete()
              .eq(VAULT_PK_COLUMN, itemToDelete.id)
              .eq("user_id", currentUser.id);
            if (error) Alert.alert("Delete Error", error.message);
            else {
              Alert.alert("Success", "Password deleted.");
              await fetchPasswords();
            }
            setScreenLoading(false);
          },
        },
      ]
    );
  };

  const handleTogglePasswordVisibility = async (item: PasswordEntry) => {
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);

    if (showPasswordId === item.id) {
      setShowPasswordId(null);
      setRevealedPassword(null);
      return;
    }

    if (isVaultLocked || !derivedEncryptionKey) {
      Alert.alert("Vault Locked", "Unlock the vault to view.");
      return;
    }
    if (!item.iv || !item.passwordEncrypted) {
      Alert.alert("Error", "Encrypted data incomplete.");
      return;
    }

    setIsPasswordLoading(true);
    const decrypted = await decryptDataWithKey(
      item.passwordEncrypted,
      item.iv,
      derivedEncryptionKey
    );
    setIsPasswordLoading(false);

    if (decrypted) {
      setShowPasswordId(item.id);
      setRevealedPassword(decrypted);
      revealTimeoutRef.current = setTimeout(() => {
        setShowPasswordId((currentId) =>
          currentId === item.id ? null : currentId
        );
        if (showPasswordId === item.id) setRevealedPassword(null);
      }, 10000);
    } else {
      Alert.alert("Decryption Error", "Could not decrypt password.");
      setShowPasswordId(null);
      setRevealedPassword(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied!", "Password copied to clipboard.");
  };

  useEffect(() => {
    if (isVaultLocked || !derivedEncryptionKey) {
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
      setShowPasswordId(null);
      setRevealedPassword(null);
    }
  }, [isVaultLocked, derivedEncryptionKey]);

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    };
  }, []);

  return {
    passwords,
    fetchPasswords,
    handleModalSubmit,
    handleDeletePassword,
    showPasswordId,
    revealedPassword,
    handleTogglePasswordVisibility,
    copyToClipboard,
    isPasswordLoading,
    isRefreshingPasswords,
  };
}
