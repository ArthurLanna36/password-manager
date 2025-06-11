// components/VaultUnlockView.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
// 1. Import necessary components from react-native-paper
import {
  Dialog,
  Button as PaperButton,
  Text as PaperText,
  Portal,
  TextInput,
} from "react-native-paper";

interface VaultUnlockViewProps {
  masterPasswordInput: string;
  setMasterPasswordInput: (password: string) => void;
  handleUnlockVault: () => Promise<boolean>;
  isLoading: boolean;
}

export function VaultUnlockView({
  masterPasswordInput,
  setMasterPasswordInput,
  handleUnlockVault,
  isLoading,
}: VaultUnlockViewProps) {
  const colorScheme = useColorScheme() ?? "light";
  const [isDialogVisible, setIsDialogVisible] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State for password visibility

  const themedButtonStyle = [
    styles.button,
    {
      backgroundColor: Colors[colorScheme].tint,
    },
  ];

  const themedButtonTextStyle = [
    styles.buttonText,
    { color: Colors[colorScheme].background },
  ];

  const onSubmitEditing = async () => {
    Keyboard.dismiss();
    if (!masterPasswordInput.trim()) {
      setIsDialogVisible(true);
    } else {
      await handleUnlockVault();
    }
  };

  const hideDialog = () => setIsDialogVisible(false);

  return (
    <ThemedView style={[styles.container, styles.formContainer]}>
      <ThemedText style={styles.title}>Unlock Vault</ThemedText>
      {/* 2. Replaced RNTextInput with Paper's TextInput */}
      <TextInput
        label="Master Password"
        mode="outlined"
        style={styles.input}
        secureTextEntry={!isPasswordVisible}
        value={masterPasswordInput}
        onChangeText={setMasterPasswordInput}
        onSubmitEditing={onSubmitEditing}
        autoCapitalize="none"
        // 4. Added right icon for password visibility
        right={
          <TextInput.Icon
            icon={isPasswordVisible ? "eye-off" : "eye"}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          />
        }
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

      <Portal>
        <Dialog visible={isDialogVisible} onDismiss={hideDialog}>
          <Dialog.Title style={{ color: Colors[colorScheme].text }}>
            Error
          </Dialog.Title>
          <Dialog.Content>
            <PaperText style={{ color: Colors[colorScheme].text }}>
              Please enter your master password.
            </PaperText>
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton
              onPress={hideDialog}
              textColor={Colors[colorScheme].tint}
            >
              OK
            </PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ThemedView>
  );
}

// 5. Simplified styles for the input
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
    width: "90%",
    alignSelf: "center",
    marginBottom: 15,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    alignSelf: "center",
    marginTop: 20,
  },
  buttonText: { fontSize: 16, fontWeight: "600" },
});
