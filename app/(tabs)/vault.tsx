import { PasswordListItem } from "@/components/PasswordListItem";
import { PasswordModal } from "@/components/PasswordModal";
import { ThemedView } from "@/components/ThemedView";
import { VaultEmptyStateView } from "@/components/VaultEmptyStateView";
import { VaultLoadingView } from "@/components/VaultLoadingView";
import { VaultSetupView } from "@/components/VaultSetupView";
import { VaultUnlockView } from "@/components/VaultUnlockView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { usePasswordManager } from "@/hooks/usePasswordManager";
import { useVaultStatus } from "@/hooks/useVaultStatus";
import { PasswordEntry, PasswordFormData } from "@/types/vault";
import { decryptDataWithKey } from "@/utils/encryptionService";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function VaultScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const [isScreenLoading, setIsScreenLoading] = useState(true);

  const {
    derivedEncryptionKey,
    isVaultLocked,
    needsVaultSetup,
    isLoading: isVaultStatusLoading,
    checkVaultStatusInternal,
    handleMasterPasswordSubmit,
    masterPasswordInput,
    setMasterPasswordInput,
    setupMasterPassword,
    setSetupMasterPassword,
    confirmSetupMasterPassword,
    setConfirmSetupMasterPassword,
    currentUser,
  } = useVaultStatus();

  const {
    passwords,
    fetchPasswords,
    handleModalSubmit: pmHandleModalSubmit,
    handleDeletePassword: pmHandleDeletePassword,
    copyToClipboard,
    isPasswordLoading,
    isRefreshingPasswords,
  } = usePasswordManager({
    currentUser,
    derivedEncryptionKey,
    isVaultLocked,
    setScreenLoading: setIsScreenLoading,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(
    null
  );

  useFocusEffect(
    useCallback(() => {
      setIsScreenLoading(true);
      checkVaultStatusInternal().finally(() => {
        if (needsVaultSetup || isVaultLocked) {
          setIsScreenLoading(false);
        }
      });
      return () => {};
    }, [checkVaultStatusInternal, needsVaultSetup, isVaultLocked])
  );

  useEffect(() => {
    if (!isVaultLocked && derivedEncryptionKey && currentUser) {
      setIsScreenLoading(true);
      fetchPasswords().finally(() => setIsScreenLoading(false));
    } else {
      if (!currentUser || isVaultLocked) {
        setIsScreenLoading(false);
      }
    }
  }, [isVaultLocked, derivedEncryptionKey, currentUser, fetchPasswords]);

  const onRefresh = useCallback(async () => {
    if (!isVaultLocked && derivedEncryptionKey) {
      await fetchPasswords(true);
    }
  }, [isVaultLocked, derivedEncryptionKey, fetchPasswords]);

  const handleOpenModal = (item: PasswordEntry | null) => {
    if (isVaultLocked) {
      Alert.alert("Vault Locked", "Unlock the vault to manage passwords.");
      return;
    }
    setEditingPassword(item);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingPassword(null);
  };

  const onPasswordFormSubmit = async (formData: PasswordFormData) => {
    Keyboard.dismiss();
    const success = await pmHandleModalSubmit(formData, editingPassword);
    if (success) {
      handleModalClose();
    }
  };

  const handleRevealPassword = async (item: PasswordEntry) => {
    if (!derivedEncryptionKey) return null;
    return decryptDataWithKey(
      item.passwordEncrypted,
      item.iv,
      derivedEncryptionKey
    );
  };

  if (isVaultStatusLoading && !currentUser && !derivedEncryptionKey) {
    return <VaultLoadingView message="Initializing..." />;
  }

  if (needsVaultSetup) {
    return (
      <VaultSetupView
        setupMasterPassword={setupMasterPassword}
        setSetupMasterPassword={setSetupMasterPassword}
        confirmSetupMasterPassword={confirmSetupMasterPassword}
        setConfirmSetupMasterPassword={setConfirmSetupMasterPassword}
        handleSetupVault={() => handleMasterPasswordSubmit(setupMasterPassword)}
        isLoading={isVaultStatusLoading}
      />
    );
  }

  if (isVaultLocked) {
    return (
      <VaultUnlockView
        masterPasswordInput={masterPasswordInput}
        setMasterPasswordInput={setMasterPasswordInput}
        handleUnlockVault={() =>
          handleMasterPasswordSubmit(masterPasswordInput)
        }
        isLoading={isVaultStatusLoading}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      {isScreenLoading && passwords.length === 0 && !isRefreshingPasswords ? (
        <VaultLoadingView message="Loading passwords..." />
      ) : (
        <FlatList
          data={passwords}
          renderItem={({ item }) => (
            <PasswordListItem
              item={item}
              onPress={() => handleOpenModal(item)}
            />
          )}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContentContainer}
          ListEmptyComponent={
            !isPasswordLoading && !isScreenLoading ? (
              <VaultEmptyStateView />
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshingPasswords}
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
        onPress={() => handleOpenModal(null)}
        disabled={isScreenLoading || isPasswordLoading}
      >
        <Feather name="plus" size={30} color={Colors[colorScheme].background} />
      </TouchableOpacity>
      <PasswordModal
        visible={modalVisible}
        onClose={handleModalClose}
        onSubmit={onPasswordFormSubmit}
        initialData={editingPassword}
        onRevealPassword={handleRevealPassword}
        onDeletePassword={pmHandleDeletePassword}
        onCopyToClipboard={copyToClipboard}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContentContainer: { paddingTop: 10, paddingBottom: 90 },
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
