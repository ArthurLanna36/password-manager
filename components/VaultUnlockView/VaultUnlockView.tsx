// components/VaultUnlockView.tsx
import { ThemedText } from "@/components/ThemedText/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useState } from "react";
import { ActivityIndicator, Keyboard, TouchableOpacity } from "react-native";
import {
  Dialog,
  Button as PaperButton,
  Text as PaperText,
  Portal,
  TextInput,
} from "react-native-paper";
import { styles } from "./vaultUnlockView.styles";

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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

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
      <TextInput
        label="Master Password"
        mode="outlined"
        style={styles.input}
        secureTextEntry={!isPasswordVisible}
        value={masterPasswordInput}
        onChangeText={setMasterPasswordInput}
        onSubmitEditing={onSubmitEditing}
        autoCapitalize="none"
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
