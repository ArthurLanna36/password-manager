// components/VaultSetupView.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  TextInput as RNTextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

// Props for the VaultSetupView component
interface VaultSetupViewProps {
  setupMasterPassword: string;
  setSetupMasterPassword: (password: string) => void;
  confirmSetupMasterPassword: string;
  setConfirmSetupMasterPassword: (password: string) => void;
  // Corrected the return type here
  handleSetupVault: () => Promise<boolean>; // Changed from Promise<void>
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
  const colorScheme = useColorScheme() ?? "light";

  const themedInputStyle = [
    styles.input,
    {
      borderColor: Colors[colorScheme].icon,
      color: Colors[colorScheme].text,
      backgroundColor: Colors[colorScheme].background,
    },
  ];

  const themedButtonStyle = [
    styles.button,
    {
      backgroundColor: Colors[colorScheme].tint,
      marginTop: 20,
    },
  ];

  const themedButtonTextStyle = [
    styles.buttonText,
    { color: Colors[colorScheme].background },
  ];

  const onSubmitEditing = async () => {
    Keyboard.dismiss();
    await handleSetupVault(); // Call the setup function
  };

  return (
    <ThemedView style={[styles.container, styles.formContainer]}>
      <ThemedText style={styles.title}>Set Up Your Secure Vault</ThemedText>
      <ThemedText style={styles.instructions}>
        Create a strong master password. This password will encrypt all your
        other passwords. **Do not forget it, as it cannot be recovered!**
      </ThemedText>
      <RNTextInput
        style={themedInputStyle}
        placeholder="New Master Password"
        placeholderTextColor={Colors[colorScheme].icon}
        secureTextEntry
        value={setupMasterPassword}
        onChangeText={setSetupMasterPassword}
        autoCapitalize="none"
      />
      <RNTextInput
        style={themedInputStyle}
        placeholder="Confirm Master Password"
        placeholderTextColor={Colors[colorScheme].icon}
        secureTextEntry
        value={confirmSetupMasterPassword}
        onChangeText={setConfirmSetupMasterPassword}
        onSubmitEditing={onSubmitEditing}
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={themedButtonStyle}
        onPress={onSubmitEditing}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors[colorScheme].background} />
        ) : (
          <ThemedText style={themedButtonTextStyle}>
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
    width: "100%", // Ensure the form container takes full width for centering inputs
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
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === "ios" ? 15 : 12,
    marginBottom: 15,
    fontSize: 16,
    width: "90%",
    alignSelf: "center",
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    alignSelf: "center",
  },
  buttonText: { fontSize: 16, fontWeight: "600" },
});
