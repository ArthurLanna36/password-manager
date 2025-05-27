// components/VaultUnlockView.tsx
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

// Props for the VaultUnlockView component
interface VaultUnlockViewProps {
  masterPasswordInput: string;
  setMasterPasswordInput: (password: string) => void;
  // Ensure this matches the return type of the function being passed
  handleUnlockVault: () => Promise<boolean>; // Changed from Promise<void>
  isLoading: boolean;
}

export function VaultUnlockView({
  masterPasswordInput,
  setMasterPasswordInput,
  handleUnlockVault,
  isLoading,
}: VaultUnlockViewProps) {
  const colorScheme = useColorScheme() ?? "light";

  // Styles that depend on the color scheme
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

  // Function to handle submission and dismiss keyboard
  const onSubmitEditing = async () => {
    Keyboard.dismiss(); // Dismiss keyboard
    await handleUnlockVault(); // Call the unlock function
  };

  return (
    <ThemedView style={[styles.container, styles.formContainer]}>
      <ThemedText style={styles.title}>Unlock Vault</ThemedText>
      <RNTextInput
        style={themedInputStyle}
        placeholder="Master Password"
        placeholderTextColor={Colors[colorScheme].icon}
        secureTextEntry
        value={masterPasswordInput}
        onChangeText={setMasterPasswordInput}
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
          <ThemedText style={themedButtonTextStyle}>Unlock</ThemedText>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
}

// Styles for the VaultUnlockView component
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
