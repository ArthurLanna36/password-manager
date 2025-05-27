// app/(tabs)/vault.tsx
import { PasswordModal } from "@/components/PasswordModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/constants/supabase";
import { useColorScheme } from "@/hooks/useColorScheme";
import { PasswordEntry, PasswordFormData } from "@/types/vault";
import {
  decryptDataWithKey,
  deriveKeyFromMasterPassword,
  encryptDataWithKey,
  generateSalt,
} from "@/utils/encryptionService"; // Adjust path if necessary
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard"; // Import Clipboard
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react"; // Added useRef
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Platform,
  RefreshControl,
  TextInput as RNTextInput, // Renamed to avoid conflict if GestureHandler TextInput is used here
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

// Constants for table and column names
const VAULT_TABLE_NAME = "vault_passwords";
const VAULT_PK_COLUMN = "password_id"; // Your primary key for the passwords table
const PROFILES_TABLE_NAME = "user_profiles";
const VERIFICATION_STRING = "vault_ok_check"; // String to verify master password

export default function VaultScreen() {
  const colorScheme = useColorScheme() ?? "light";

  // Screen States
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true); // For initial loading and operations
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Cryptography and Vault States
  const [userSalt, setUserSalt] = useState<string | null>(null);
  const [derivedEncryptionKey, setDerivedEncryptionKey] = useState<
    string | null
  >(null);
  const [isVaultLocked, setIsVaultLocked] = useState(true); // Vault starts locked
  const [masterPasswordInput, setMasterPasswordInput] = useState(""); // For user input to unlock

  // Initial Vault Setup States
  const [needsVaultSetup, setNeedsVaultSetup] = useState(false);
  const [setupMasterPassword, setSetupMasterPassword] = useState("");
  const [confirmSetupMasterPassword, setConfirmSetupMasterPassword] =
    useState("");

  // New states for revealing password in the list
  const [showPasswordId, setShowPasswordId] = useState<string | null>(null); // ID of the item whose password is being shown
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null); // The decrypted password string
  const revealTimeoutRef = useRef<number | null>(null); // Ref to store the timeout ID for auto-hiding revealed password (CORRECTED TYPE)

  // Fetches user profile (salt, verification data) from Supabase
  const fetchUserProfile = useCallback(async (userId: string) => {
    console.log(`[VaultScreen] Fetching profile for user: ${userId}`);
    const { data, error } = await supabase
      .from(PROFILES_TABLE_NAME)
      .select(
        "encryption_salt, master_password_verify_cipher, master_password_verify_iv"
      )
      .eq("id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116: no rows found, not an error for this check
      console.error(
        "[VaultScreen] Error fetching user profile:",
        error.message
      );
      Alert.alert(
        "Profile Error",
        "Could not load your profile data for encryption."
      );
      return null;
    }
    console.log(
      "[VaultScreen] User profile data:",
      data ? "Profile found" : "No profile yet"
    );
    return data;
  }, []);

  // Checks vault status on screen focus (configured? locked?)
  const checkVaultStatus = useCallback(async () => {
    console.log("[VaultScreen] checkVaultStatus called.");
    setIsLoading(true);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log(
        "[VaultScreen] User not logged in or error fetching user. Vault remains locked."
      );
      setIsVaultLocked(true);
      setNeedsVaultSetup(false);
      setPasswords([]);
      setDerivedEncryptionKey(null);
      setShowPasswordId(null); // Ensure revealed password state is cleared
      setRevealedPassword(null);
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current); // Clear any pending timeout
      setIsLoading(false);
      return;
    }

    const profile = await fetchUserProfile(user.id);
    if (profile && profile.encryption_salt) {
      setUserSalt(profile.encryption_salt);
      setNeedsVaultSetup(false);
      if (derivedEncryptionKey) {
        setIsVaultLocked(false);
      } else {
        setIsVaultLocked(true);
        setShowPasswordId(null); // Clear revealed password if vault gets locked
        setRevealedPassword(null);
        if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
      }
    } else {
      console.log(
        "[VaultScreen] User needs to set up the vault (no salt found)."
      );
      setNeedsVaultSetup(true);
      setIsVaultLocked(true);
      setPasswords([]);
      setDerivedEncryptionKey(null);
      setShowPasswordId(null);
      setRevealedPassword(null);
      if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    }
    setIsLoading(false);
  }, [fetchUserProfile, derivedEncryptionKey]);

  useFocusEffect(
    useCallback(() => {
      checkVaultStatus();
      // Cleanup for revealed password when screen loses focus or on unmount
      return () => {
        if (revealTimeoutRef.current) {
          clearTimeout(revealTimeoutRef.current);
        }
        setShowPasswordId(null);
        setRevealedPassword(null);
      };
    }, [checkVaultStatus])
  );

  // Fetches passwords from Supabase if vault is unlocked and key is derived
  const fetchPasswords = useCallback(
    async (isRefresh = false) => {
      if (isVaultLocked || !derivedEncryptionKey) {
        console.log(
          "[VaultScreen] Vault locked or encryption key not available. Skipping password fetch."
        );
        setPasswords([]); // Clear passwords if vault is locked or key is missing
        if (!isRefresh) setIsLoading(false);
        if (isRefresh) setIsRefreshing(false);
        return;
      }

      if (!isRefresh) setIsLoading(true);
      if (isRefresh) setIsRefreshing(true);
      console.log("[VaultScreen] Fetching passwords from Supabase...");

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user)
          throw new Error("User not authenticated for fetching passwords.");

        const { data, error: dbError } = await supabase
          .from(VAULT_TABLE_NAME)
          .select(
            `${VAULT_PK_COLUMN}, user_id, service_name, username, encrypted_password, iv, created_at, updated_at`
          )
          .eq("user_id", user.id)
          .order("service_name", { ascending: true });

        if (dbError) throw dbError;

        if (data) {
          const loadedPasswords: PasswordEntry[] = data.map((item: any) => ({
            id: item[VAULT_PK_COLUMN],
            userId: item.user_id,
            serviceName: item.service_name,
            username: item.username,
            passwordEncrypted: item.encrypted_password,
            iv: item.iv,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          }));
          setPasswords(loadedPasswords);
          console.log(
            `[VaultScreen] Fetched ${loadedPasswords.length} passwords.`
          );
        } else {
          setPasswords([]);
        }
      } catch (error: any) {
        console.error("[VaultScreen] Error in fetchPasswords:", error.message);
        Alert.alert("Error Loading Passwords", error.message);
        setPasswords([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isVaultLocked, derivedEncryptionKey] // Dependencies for useCallback
  );

  // Effect to fetch passwords when vault becomes unlocked and key is available
  useEffect(() => {
    if (!isVaultLocked && derivedEncryptionKey) {
      console.log(
        "[VaultScreen] Vault unlocked and key derived, fetching passwords."
      );
      fetchPasswords();
    }
  }, [isVaultLocked, derivedEncryptionKey, fetchPasswords]); // fetchPasswords is now a dependency

  const onRefresh = useCallback(() => {
    if (!isVaultLocked && derivedEncryptionKey) {
      fetchPasswords(true); // Pass true to indicate it's a refresh action
    } else {
      // If vault is locked, just stop the refresh indicator
      setIsRefreshing(false);
    }
  }, [isVaultLocked, derivedEncryptionKey, fetchPasswords]);

  // --- Vault Setup and Unlock Functions ---
  const handleSetupVault = async () => {
    if (setupMasterPassword !== confirmSetupMasterPassword) {
      Alert.alert("Error", "Master passwords do not match.");
      return;
    }
    if (setupMasterPassword.length < 8) {
      // Basic password length check
      Alert.alert("Error", "Master password must be at least 8 characters.");
      return;
    }
    setIsLoading(true);
    Keyboard.dismiss();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Error", "User not found for setup.");
      setIsLoading(false);
      return;
    }

    try {
      const newSalt = await generateSalt();
      const newDerivedKey = await deriveKeyFromMasterPassword(
        setupMasterPassword,
        newSalt
      );
      const encryptedVerification = await encryptDataWithKey(
        VERIFICATION_STRING,
        newDerivedKey
      );

      if (!encryptedVerification)
        throw new Error("Failed to encrypt verification data for setup.");

      const { error: profileError } = await supabase
        .from(PROFILES_TABLE_NAME)
        .insert({
          // Changed to insert as profile might not exist yet
          id: user.id,
          encryption_salt: newSalt,
          master_password_verify_cipher: encryptedVerification.cipherTextHex,
          master_password_verify_iv: encryptedVerification.ivHex,
        });
      if (profileError) throw profileError;

      setUserSalt(newSalt);
      setDerivedEncryptionKey(newDerivedKey);
      setNeedsVaultSetup(false);
      setIsVaultLocked(false);
      setSetupMasterPassword("");
      setConfirmSetupMasterPassword("");
      setMasterPasswordInput(""); // Clear this too, as the vault is now "unlocked" with the new key
      Alert.alert("Success", "Vault configured and unlocked!");
    } catch (error: any) {
      console.error("[VaultScreen] Error setting up vault:", error.message);
      Alert.alert("Setup Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlockVault = async () => {
    if (!masterPasswordInput.trim() || !userSalt) {
      Alert.alert("Error", "Please enter your master password.");
      return;
    }
    setIsLoading(true);
    Keyboard.dismiss();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Error", "User not found for unlock.");
      setIsLoading(false);
      return;
    }

    try {
      const key = await deriveKeyFromMasterPassword(
        masterPasswordInput,
        userSalt
      );
      const profile = await fetchUserProfile(user.id);

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
        console.log(
          "[VaultScreen] Unlock - Decrypted Verification:",
          decryptedVerification,
          "Expected:",
          VERIFICATION_STRING
        );
        if (decryptedVerification === VERIFICATION_STRING) {
          setDerivedEncryptionKey(key);
          setIsVaultLocked(false);
          setMasterPasswordInput(""); // Clear input after successful unlock
          Alert.alert("Success", "Vault Unlocked!");
        } else {
          Alert.alert("Unlock Failed", "Incorrect master password.");
          setDerivedEncryptionKey(null); // Ensure key is null on failure
        }
      } else {
        // This case implies the profile exists but lacks verification data, or profile doesn't exist
        Alert.alert(
          "Configuration Error",
          "User profile or verification data not found. Please set up the vault."
        );
        setNeedsVaultSetup(true); // Guide user to setup
        setDerivedEncryptionKey(null);
      }
    } catch (error: any) {
      console.error("[VaultScreen] Error unlocking vault:", error.message);
      Alert.alert("Unlock Error", "Failed to unlock the vault.");
      setDerivedEncryptionKey(null); // Ensure key is null on error
    } finally {
      setIsLoading(false);
    }
  };

  // --- Password CRUD Functions ---
  const handleModalSubmit = async (formData: PasswordFormData) => {
    if (isVaultLocked || !derivedEncryptionKey) {
      Alert.alert(
        "Error",
        "Vault is locked. Please unlock with your master password."
      );
      return;
    }
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert("Error", "Invalid user session.");
      setIsLoading(false);
      return;
    }

    // Password must be provided for new entries.
    // For edits, if passwordPlain is empty, we keep the old encrypted password.
    if (!formData.passwordPlain && !editingPassword) {
      Alert.alert(
        "Validation Error",
        "Password cannot be empty for new entries."
      );
      setIsLoading(false);
      return;
    }

    let cipherTextHex = editingPassword?.passwordEncrypted;
    let ivHex = editingPassword?.iv;

    // Only re-encrypt if a new password (formData.passwordPlain) was provided.
    if (formData.passwordPlain) {
      const encryptedResult = await encryptDataWithKey(
        formData.passwordPlain,
        derivedEncryptionKey
      );
      if (!encryptedResult) {
        Alert.alert("Encryption Error", "Could not encrypt password data.");
        setIsLoading(false);
        return;
      }
      cipherTextHex = encryptedResult.cipherTextHex;
      ivHex = encryptedResult.ivHex;
    } else if (editingPassword && !formData.passwordPlain) {
      // If editing and password field is empty, keep the old encrypted data
      cipherTextHex = editingPassword.passwordEncrypted;
      ivHex = editingPassword.iv;
    }

    try {
      if (editingPassword && editingPassword.id) {
        // Update existing password
        const { error } = await supabase
          .from(VAULT_TABLE_NAME)
          .update({
            service_name: formData.serviceName,
            username: formData.username || null, // Store as NULL if empty
            encrypted_password: cipherTextHex, // Use new or existing encrypted data
            iv: ivHex, // Use new or existing IV
            updated_at: new Date().toISOString(),
          })
          .eq(VAULT_PK_COLUMN, editingPassword.id)
          .eq("user_id", user.id); // Ensure user can only update their own
        if (error) throw error;
        Alert.alert("Success", "Password updated!");
      } else {
        // Add new password
        if (!cipherTextHex || !ivHex) {
          // This should not happen if logic above is correct
          Alert.alert(
            "Internal Error",
            "Encryption data is missing for new entry."
          );
          setIsLoading(false);
          return;
        }
        const { error } = await supabase
          .from(VAULT_TABLE_NAME)
          .insert([
            {
              user_id: user.id,
              service_name: formData.serviceName,
              username: formData.username || null,
              encrypted_password: cipherTextHex,
              iv: ivHex,
            },
          ])
          .select(); // .select() is optional here, insert doesn't return data by default unless specified
        if (error) throw error;
        Alert.alert("Success", "Password added!");
      }
      fetchPasswords(); // Refresh list after successful operation
    } catch (error: any) {
      console.error(
        "[VaultScreen] Error saving password to Supabase:",
        error.message
      );
      Alert.alert("Save Error", error.message);
    } finally {
      setIsLoading(false);
      handleModalClose(); // Close modal regardless of success/failure after attempting save
    }
  };

  const handleDeletePassword = async (itemToDelete: PasswordEntry) => {
    if (isVaultLocked || !derivedEncryptionKey) {
      Alert.alert(
        "Vault Locked",
        "Please unlock the vault to delete passwords."
      );
      return;
    }
    if (!itemToDelete || !itemToDelete.id) {
      Alert.alert("Error", "Invalid item for deletion.");
      return;
    }

    Alert.alert(
      "Delete Password",
      `Are you sure you want to delete the password for "${itemToDelete.serviceName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
              Alert.alert("Authentication Error", "User session not found.");
              setIsLoading(false);
              return;
            }

            const { error: deleteError } = await supabase
              .from(VAULT_TABLE_NAME)
              .delete()
              .eq(VAULT_PK_COLUMN, itemToDelete.id)
              .eq("user_id", user.id); // Ensure user can only delete their own

            if (deleteError) {
              console.error(
                "[VaultScreen] Error deleting password from Supabase:",
                deleteError.message
              );
              Alert.alert(
                "Delete Error",
                `Could not delete password: ${deleteError.message}`
              );
            } else {
              Alert.alert(
                "Success",
                `Password for "${itemToDelete.serviceName}" deleted.`
              );
              fetchPasswords(); // Refresh list
            }
            setIsLoading(false);
          },
        },
      ]
    );
  };

  // --- UI Open/Close Handlers ---
  const handleOpenAddModal = () => {
    if (isVaultLocked) {
      Alert.alert("Vault Locked", "Unlock the vault to add passwords.");
      return;
    }
    setEditingPassword(null); // Ensure not in edit mode
    setModalVisible(true);
  };

  const handleOpenEditModal = (item: PasswordEntry) => {
    if (isVaultLocked) {
      Alert.alert("Vault Locked", "Unlock the vault to edit passwords.");
      return;
    }
    setEditingPassword(item); // Set item being edited
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingPassword(null); // Clear editing state when modal closes
  };

  // Function to toggle password visibility in the list
  const handleTogglePasswordVisibility = async (item: PasswordEntry) => {
    // Clear any existing timeout if user interacts again
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }

    if (showPasswordId === item.id) {
      // If currently shown, hide it immediately
      setShowPasswordId(null);
      setRevealedPassword(null);
      return;
    }

    // If trying to show a new password
    if (isVaultLocked || !derivedEncryptionKey) {
      Alert.alert("Vault Locked", "Unlock the vault to view the password.");
      setShowPasswordId(null); // Ensure states are reset if vault is locked
      setRevealedPassword(null);
      return;
    }
    if (!item.iv || !item.passwordEncrypted) {
      Alert.alert(
        "Error",
        "Encrypted password data is incomplete (missing IV or ciphertext)."
      );
      setShowPasswordId(null);
      setRevealedPassword(null);
      return;
    }

    setIsLoading(true); // Using global isLoading; consider item-specific loading if preferred
    const decrypted = await decryptDataWithKey(
      item.passwordEncrypted,
      item.iv,
      derivedEncryptionKey
    );
    setIsLoading(false);

    if (decrypted) {
      setShowPasswordId(item.id);
      setRevealedPassword(decrypted);

      // Set a new timeout to hide the password
      revealTimeoutRef.current = setTimeout(() => {
        // Only hide if this specific item is still the one being shown.
        // This uses a functional update for setShowPasswordId to get the latest state.
        setShowPasswordId((currentShowPasswordId) => {
          if (currentShowPasswordId === item.id) {
            setRevealedPassword(null); // Clear the revealed password text first
            return null; // Then clear the ID, effectively hiding it
          }
          return currentShowPasswordId; // Otherwise, no change to which ID is shown
        });
        revealTimeoutRef.current = null; // Clear the ref after timeout executes or is cleared
      }, 10000); // Hide after 10 seconds
    } else {
      Alert.alert(
        "Decryption Error",
        "Could not decrypt password. Incorrect Master Password or corrupted data?"
      );
      setShowPasswordId(null); // Ensure states are reset on decryption failure
      setRevealedPassword(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied!", "Password copied to clipboard.");
  };

  // --- Render Item for FlatList ---
  const renderPasswordItem = ({ item }: { item: PasswordEntry }) => {
    const isRevealed = showPasswordId === item.id && revealedPassword !== null;

    return (
      <ThemedView style={styles.itemOuterContainer}>
        {/* Main content area of the item (service name, username, revealed password) */}
        <View style={styles.itemContentContainer}>
          <View style={styles.itemTextContainer}>
            <ThemedText style={styles.itemText}>{item.serviceName}</ThemedText>
            {item.username && (
              <ThemedText style={styles.itemUsernameText}>
                {item.username}
              </ThemedText>
            )}
            {/* Conditionally render the revealed password */}
            {isRevealed && (
              <View style={styles.revealedPasswordContainer}>
                <ThemedText style={styles.revealedPasswordText}>
                  {revealedPassword}
                </ThemedText>
                <TouchableOpacity
                  onPress={() => copyToClipboard(revealedPassword!)}
                  style={styles.copyButton}
                >
                  <Feather
                    name="copy"
                    size={18}
                    color={Colors[colorScheme].tint}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Action buttons (Reveal, Edit, Delete) */}
        <View style={styles.itemActions}>
          <TouchableOpacity
            onPress={() => handleTogglePasswordVisibility(item)}
            style={styles.actionButton}
            disabled={isLoading || isVaultLocked} // Disable if loading or vault is locked
          >
            <Feather
              name={isRevealed ? "eye-off" : "eye"} // Toggle icon based on revealed state
              size={20}
              color={
                isLoading || isVaultLocked
                  ? Colors[colorScheme].icon // Dimmed color when disabled
                  : Colors[colorScheme].tint // Active color
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleOpenEditModal(item)}
            style={styles.actionButton}
            disabled={isLoading || isVaultLocked}
          >
            <Feather
              name="edit-2"
              size={20}
              color={
                isLoading || isVaultLocked
                  ? Colors[colorScheme].icon
                  : Colors[colorScheme].tint
              }
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeletePassword(item)}
            style={styles.actionButton}
            disabled={isLoading || isVaultLocked}
          >
            <Feather
              name="trash-2"
              size={20}
              color={
                isLoading || isVaultLocked
                  ? Colors[colorScheme].icon
                  : "#FF6347" // Specific color for delete action
              }
            />
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  };

  // --- Conditional UI Rendering ---
  // Initial loading state check (before vault status is known)
  if (isLoading && !userSalt && !derivedEncryptionKey && !needsVaultSetup) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </ThemedView>
    );
  }

  // Vault setup screen
  if (needsVaultSetup) {
    return (
      <ThemedView style={[styles.container, styles.unlockVaultContainer]}>
        <ThemedText style={styles.unlockTitle}>
          Set Up Your Secure Vault
        </ThemedText>
        <ThemedText style={styles.setupInstructions}>
          Create a strong master password. This password will encrypt all your
          other passwords. **Do not forget it, as it cannot be recovered!**
        </ThemedText>
        <RNTextInput // Using RNTextInput for master password inputs
          style={[
            styles.input, // General input style
            {
              // Theme-specific overrides
              borderColor: Colors[colorScheme].icon,
              color: Colors[colorScheme].text,
              backgroundColor: Colors[colorScheme].background,
            },
          ]}
          placeholder="New Master Password"
          placeholderTextColor={Colors[colorScheme].icon}
          secureTextEntry
          value={setupMasterPassword}
          onChangeText={setSetupMasterPassword}
          autoCapitalize="none"
        />
        <RNTextInput
          style={[
            styles.input,
            {
              borderColor: Colors[colorScheme].icon,
              color: Colors[colorScheme].text,
              backgroundColor: Colors[colorScheme].background,
            },
          ]}
          placeholder="Confirm Master Password"
          placeholderTextColor={Colors[colorScheme].icon}
          secureTextEntry
          value={confirmSetupMasterPassword}
          onChangeText={setConfirmSetupMasterPassword}
          onSubmitEditing={handleSetupVault} // Allow submit on return key
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[
            styles.button, // General button style
            {
              // Theme-specific overrides
              backgroundColor: Colors[colorScheme].tint,
              marginTop: 20, // Additional spacing
            },
          ]}
          onPress={handleSetupVault}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors[colorScheme].background} />
          ) : (
            <ThemedText
              style={[
                styles.buttonText, // General button text style
                { color: Colors[colorScheme].background }, // Text color for this button
              ]}
            >
              Save and Set Up Vault
            </ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Vault unlock screen
  if (isVaultLocked) {
    return (
      <ThemedView style={[styles.container, styles.unlockVaultContainer]}>
        <ThemedText style={styles.unlockTitle}>Unlock Vault</ThemedText>
        <RNTextInput
          style={[
            styles.input,
            {
              borderColor: Colors[colorScheme].icon,
              color: Colors[colorScheme].text,
              backgroundColor: Colors[colorScheme].background,
            },
          ]}
          placeholder="Master Password"
          placeholderTextColor={Colors[colorScheme].icon}
          secureTextEntry
          value={masterPasswordInput}
          onChangeText={setMasterPasswordInput}
          onSubmitEditing={handleUnlockVault} // Allow submit on return key
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: Colors[colorScheme].tint,
              marginTop: 20,
            },
          ]}
          onPress={handleUnlockVault}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors[colorScheme].background} />
          ) : (
            <ThemedText
              style={[
                styles.buttonText,
                { color: Colors[colorScheme].background },
              ]}
            >
              Unlock
            </ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Main Vault UI (when unlocked)
  return (
    <ThemedView style={styles.container}>
      {/* Loading indicator for initial password fetch */}
      {isLoading && passwords.length === 0 && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          <ThemedText style={{ marginTop: 10 }}>
            Loading passwords...
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={passwords}
          renderItem={renderPasswordItem}
          keyExtractor={(item) => String(item.id)} // Ensure ID is a string for key
          contentContainerStyle={styles.listContentContainer}
          ListEmptyComponent={
            // Displayed when the password list is empty
            !isLoading ? ( // Only show if not in the middle of loading
              <View style={styles.emptyStateContainer}>
                <ThemedText style={styles.emptyText}>
                  No passwords saved yet.
                </ThemedText>
                <ThemedText style={styles.emptySubText}>
                  Tap '+' to add one.
                </ThemedText>
              </View>
            ) : null // Don't show empty state if still loading
          }
          refreshControl={
            // Pull-to-refresh functionality
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={Colors[colorScheme].tint} // iOS spinner color
              colors={[Colors[colorScheme].tint]} // Android spinner color(s)
            />
          }
        />
      )}
      {/* Floating Action Button to add new passwords */}
      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: Colors[colorScheme].tint }, // Themed background
        ]}
        onPress={handleOpenAddModal}
        disabled={isLoading} // Disable if an operation is in progress
      >
        <Feather name="plus" size={30} color={Colors[colorScheme].background} />
      </TouchableOpacity>
      {/* Modal for adding/editing passwords */}
      <PasswordModal
        visible={modalVisible}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={editingPassword} // Pass data if editing, null if adding
      />
    </ThemedView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 }, // Main container for the screen
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" }, // Centered loading indicator
  unlockVaultContainer: {
    // Container for vault setup and unlock screens
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20, // Padding around the content
  },
  unlockTitle: {
    // Title text for setup/unlock screens
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  setupInstructions: {
    // Instructional text for vault setup
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.9,
    paddingHorizontal: 10,
  },
  input: {
    // Style for master password TextInput fields
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === "ios" ? 15 : 12,
    marginBottom: 15,
    fontSize: 16,
    width: "90%", // Make input take most of the width
  },
  button: {
    // General style for setup/unlock buttons
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "90%", // Make button take most of the width
  },
  buttonText: { fontSize: 16, fontWeight: "600" }, // Text style for buttons
  listContentContainer: { paddingTop: 10, paddingBottom: 90 }, // Padding for FlatList content
  itemOuterContainer: {
    // Container for each password item in the list
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", // Align items vertically centered
    marginHorizontal: 15,
    marginVertical: 6,
    paddingVertical: 10, // Vertical padding inside the item
    paddingHorizontal: 15, // Horizontal padding
    borderRadius: 10,
    // Background color will be applied by ThemedView
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3, // Shadow for Android
  },
  itemContentContainer: {
    // Container for text content (service, username, revealed password)
    flex: 1, // Take available space
    marginRight: 10, // Space before action buttons
  },
  itemTextContainer: {
    // Wraps all text elements
    // No specific styles needed here, children will define their own
  },
  itemText: { fontSize: 18, fontWeight: "bold" }, // Service name text
  itemUsernameText: { fontSize: 14, opacity: 0.7, marginTop: 3 }, // Username text
  revealedPasswordContainer: {
    // Container for the revealed password and copy button
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: "rgba(128,128,128,0.1)", // Subtle background for revealed password
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  revealedPasswordText: {
    // Text style for the revealed password
    fontSize: 15,
    flexShrink: 1, // Allow text to shrink if too long before copy icon
  },
  copyButton: {
    // Touchable area for the copy icon
    marginLeft: 10, // Space between password text and copy icon
    padding: 5, // Clickable area
  },
  itemActions: {
    // Container for action buttons (reveal, edit, delete)
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    // Style for individual action buttons
    padding: 8, // Touch area
    marginLeft: 8, // Space between action buttons
  },
  emptyStateContainer: {
    // Container for when the password list is empty
    flex: 1, // Take up available space
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50, // Add some space from the top
    paddingBottom: 60, // Space from the bottom/add button
  },
  emptyText: { textAlign: "center", fontSize: 18, opacity: 0.8 }, // Main empty state text
  emptySubText: {
    // Sub-text for empty state
    textAlign: "center",
    fontSize: 15,
    opacity: 0.6,
    marginTop: 8,
  },
  addButton: {
    // Floating action button for adding new passwords
    position: "absolute",
    right: 25,
    bottom: 25,
    width: 60,
    height: 60,
    borderRadius: 30, // Make it circular
    justifyContent: "center",
    alignItems: "center",
    elevation: 8, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
