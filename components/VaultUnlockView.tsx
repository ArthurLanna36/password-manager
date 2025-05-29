// components/VaultUnlockView.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useState } from "react"; // Adicionado useState
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  TextInput as RNTextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
// Importações do react-native-paper
import {
  Dialog,
  Button as PaperButton,
  Text as PaperText,
  Portal,
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
  const [isDialogVisible, setIsDialogVisible] = useState(false); // Estado para controlar a visibilidade do Dialog

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
    if (!masterPasswordInput.trim()) {
      setIsDialogVisible(true); // Mostra o Dialog se a senha estiver vazia
    } else {
      await handleUnlockVault();
    }
  };

  const hideDialog = () => setIsDialogVisible(false);

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
        onSubmitEditing={onSubmitEditing} // Mantido para submissão via teclado
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={themedButtonStyle}
        onPress={onSubmitEditing} // O botão também chamará onSubmitEditing
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
