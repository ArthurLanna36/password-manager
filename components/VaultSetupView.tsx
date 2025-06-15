// components/VaultSetupView.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { TextInput } from "react-native-paper";

interface VaultSetupViewProps {
  setupMasterPassword: string;
  setSetupMasterPassword: (password: string) => void;
  confirmSetupMasterPassword: string;
  setConfirmSetupMasterPassword: (password: string) => void;
  handleSetupVault: () => Promise<boolean>;
  isLoading: boolean;
}

export function VaultSetupView({
  setupMasterPassword,
  setSetupMasterPassword,
  confirmSetupMasterPassword,
  setConfirmSetupMasterPassword,
  handleSetupVault,
  isLoading,
}: VaultSetupViewProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const onSubmitEditing = async () => {
    Keyboard.dismiss();
    await handleSetupVault();
  };

  return (
    <ThemedView style={[styles.container, styles.formContainer]}>
      <ThemedText style={styles.title}>Set Up Your Secure Vault</ThemedText>
      <ThemedText style={styles.instructions}>
        Create a strong master password. This password will encrypt all your
        other passwords. **Do not forget it, as it cannot be recovered!**
      </ThemedText>
      <TextInput
        label="New Master Password"
        style={styles.input}
        secureTextEntry={!isPasswordVisible}
        value={setupMasterPassword}
        onChangeText={setSetupMasterPassword}
        autoCapitalize="none"
        right={
          <TextInput.Icon
            icon={isPasswordVisible ? "eye-off" : "eye"}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          />
        }
      />
      <TextInput
        label="Confirm Master Password"
        style={styles.input}
        secureTextEntry={!isConfirmPasswordVisible}
        value={confirmSetupMasterPassword}
        onChangeText={setConfirmSetupMasterPassword}
        onSubmitEditing={onSubmitEditing}
        autoCapitalize="none"
        right={
          <TextInput.Icon
            icon={isConfirmPasswordVisible ? "eye-off" : "eye"}
            onPress={() =>
              setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
            }
          />
        }
      />
      <TouchableOpacity
        style={[styles.button, { marginTop: 20 }]}
        onPress={onSubmitEditing}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <ThemedText style={styles.buttonText}>
            Save and Set Up Vault
          </ThemedText>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    padding: 20,
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  instructions: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.9,
    paddingHorizontal: 10,
  },
  input: {
    marginBottom: 15,
    width: "90%",
    alignSelf: "center",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    alignSelf: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
