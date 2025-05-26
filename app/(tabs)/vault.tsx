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
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Platform,
  RefreshControl,
  TextInput as RNTextInput,
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
      }
    } else {
      console.log(
        "[VaultScreen] User needs to set up the vault (no salt found)."
      );
      setNeedsVaultSetup(true);
      setIsVaultLocked(true);
      setPasswords([]);
      setDerivedEncryptionKey(null);
    }
    setIsLoading(false);
  }, [fetchUserProfile, derivedEncryptionKey]);

  useFocusEffect(
    useCallback(() => {
      checkVaultStatus();
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
    [isVaultLocked, derivedEncryptionKey]
  ); // Dependencies for useCallback

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
      fetchPasswords(true);
    } else {
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
          setMasterPasswordInput("");
          Alert.alert("Success", "Vault Unlocked!");
        } else {
          Alert.alert("Unlock Failed", "Incorrect master password.");
          setDerivedEncryptionKey(null);
        }
      } else {
        Alert.alert(
          "Configuration Error",
          "User profile or verification data not found. Please set up the vault."
        );
        setNeedsVaultSetup(true);
        setDerivedEncryptionKey(null);
      }
    } catch (error: any) {
      console.error("[VaultScreen] Error unlocking vault:", error.message);
      Alert.alert("Unlock Error", "Failed to unlock the vault.");
      setDerivedEncryptionKey(null);
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

    const encryptedResult = await encryptDataWithKey(
      formData.passwordPlain,
      derivedEncryptionKey
    );
    if (!encryptedResult) {
      Alert.alert("Encryption Error", "Could not encrypt password data.");
      setIsLoading(false);
      return;
    }
    const { cipherTextHex, ivHex } = encryptedResult;

    try {
      if (editingPassword && editingPassword.id) {
        const { error } = await supabase
          .from(VAULT_TABLE_NAME)
          .update({
            service_name: formData.serviceName,
            username: formData.username || null,
            encrypted_password: cipherTextHex,
            iv: ivHex,
            updated_at: new Date().toISOString(),
          })
          .eq(VAULT_PK_COLUMN, editingPassword.id)
          .eq("user_id", user.id);
        if (error) throw error;
        Alert.alert("Success", "Password updated!");
      } else {
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
          .select();
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
      handleModalClose();
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
              .eq("user_id", user.id);

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
    setEditingPassword(null);
    setModalVisible(true);
  };
  const handleOpenEditModal = (item: PasswordEntry) => {
    if (isVaultLocked) {
      Alert.alert("Vault Locked", "Unlock the vault to edit passwords.");
      return;
    }
    setEditingPassword(item);
    setModalVisible(true);
  };
  const handleModalClose = () => {
    setModalVisible(false);
    setEditingPassword(null);
  };

  // --- Render Item for FlatList ---
  const renderPasswordItem = ({ item }: { item: PasswordEntry }) => {
    const showDecrypted = async () => {
      if (isVaultLocked || !derivedEncryptionKey) {
        Alert.alert("Vault Locked", "Unlock the vault to view the password.");
        return;
      }
      if (!item.iv || !item.passwordEncrypted) {
        Alert.alert(
          "Error",
          "Encrypted password data is incomplete (missing IV or ciphertext)."
        );
        return;
      }
      setIsLoading(true);
      const decrypted = await decryptDataWithKey(
        item.passwordEncrypted,
        item.iv,
        derivedEncryptionKey
      );
      setIsLoading(false);
      if (decrypted) {
        Alert.alert(
          `Password for ${item.serviceName}`,
          `Password: ${decrypted}\n\n(Temporary display. Implement secure viewing.)`
        );
      } else {
        Alert.alert(
          "Decryption Error",
          "Could not decrypt password. Incorrect Master Password or corrupted data?"
        );
      }
    };

    return (
      <View style={styles.itemOuterContainer}>
        <TouchableOpacity
          style={styles.itemContentContainer}
          onPress={showDecrypted}
        >
          <View style={styles.itemTextContainer}>
            <ThemedText style={styles.itemText}>{item.serviceName}</ThemedText>
            {item.username && (
              <ThemedText style={styles.itemUsernameText}>
                {item.username}
              </ThemedText>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.itemActions}>
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
                  : "#FF6347"
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // --- Conditional UI Rendering ---
  if (isLoading && !userSalt && !derivedEncryptionKey && !needsVaultSetup) {
    return (
      <ThemedView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
      </ThemedView>
    );
  }

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
        <RNTextInput
          style={[
            styles.input,
            {
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
          onSubmitEditing={handleSetupVault}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: Colors[colorScheme].tint,
              marginTop: 20,
              width: "90%",
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
                styles.buttonText,
                { color: Colors[colorScheme].background },
              ]}
            >
              Save and Set Up Vault
            </ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>
    );
  }

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
          onSubmitEditing={handleUnlockVault}
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: Colors[colorScheme].tint,
              marginTop: 20,
              width: "90%",
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
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContentContainer}
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.emptyStateContainer}>
                <ThemedText style={styles.emptyText}>
                  No passwords saved yet.
                </ThemedText>
                <ThemedText style={styles.emptySubText}>
                  Tap '+' to add one.
                </ThemedText>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={Colors[colorScheme].tint}
              colors={[Colors[colorScheme].tint]}
            />
          }
        />
      )}
      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: Colors[colorScheme].tint },
        ]}
        onPress={handleOpenAddModal}
        disabled={isLoading}
      >
        <Feather name="plus" size={30} color={Colors[colorScheme].background} />
      </TouchableOpacity>
      <PasswordModal
        visible={modalVisible}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={editingPassword}
      />
    </ThemedView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  unlockVaultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  unlockTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  setupInstructions: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.9,
    paddingHorizontal: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === "ios" ? 15 : 12,
    marginBottom: 15,
    fontSize: 16,
    width: "100%",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonText: { fontSize: 16, fontWeight: "600" },
  listContentContainer: { paddingTop: 10, paddingBottom: 90 },
  itemOuterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
    marginVertical: 6,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  itemContentContainer: { flex: 1, marginRight: 10 },
  itemTextContainer: {},
  itemText: { fontSize: 18, fontWeight: "bold" },
  itemUsernameText: { fontSize: 14, opacity: 0.7, marginTop: 3 },
  itemActions: { flexDirection: "row", alignItems: "center" },
  actionButton: { padding: 10, marginLeft: 10 },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 60,
  },
  emptyText: { textAlign: "center", fontSize: 18, opacity: 0.8 },
  emptySubText: {
    textAlign: "center",
    fontSize: 15,
    opacity: 0.6,
    marginTop: 8,
  },
  addButton: {
    position: "absolute",
    right: 25,
    bottom: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
