// components/PasswordModal.tsx
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { PasswordEntry, PasswordFormData } from "@/types/vault";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  Divider,
  Button as PaperButton,
  TextInput,
  useTheme,
} from "react-native-paper";
import { ThemedText } from "../ThemedText/ThemedText";
import { ThemedView } from "../ThemedView";
import { styles } from "./passwordModal.styles";

interface PasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: PasswordFormData) => void;
  initialData?: PasswordEntry | null;
  onRevealPassword: (item: PasswordEntry) => Promise<string | null>;
  onDeletePassword: (item: PasswordEntry) => void;
  onCopyToClipboard: (text: string) => void;
}

export function PasswordModal({
  visible,
  onClose,
  onSubmit,
  initialData,
  onRevealPassword,
  onDeletePassword,
  onCopyToClipboard,
}: PasswordModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const paperTheme = useTheme();
  const [serviceName, setServiceName] = useState("");
  const [username, setUsername] = useState("");
  const [passwordPlain, setPasswordPlain] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const isEditing = !!initialData;
  const modalTitle = isEditing ? "Details" : "Add New Password";
  const submitButtonText = isEditing ? "Save Changes" : "Add Password";

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setServiceName(initialData.serviceName);
        setUsername(initialData.username || "");
      } else {
        setServiceName("");
        setUsername("");
      }
      setPasswordPlain("");
      setIsPasswordVisible(false);
      setRevealedPassword(null);
    }
  }, [visible, initialData]);

  const handleSubmit = () => {
    Keyboard.dismiss();
    if (!serviceName.trim()) {
      Alert.alert("Validation Error", "Service Name is required.");
      return;
    }
    if (!isEditing && !passwordPlain.trim()) {
      Alert.alert("Validation Error", "Password is required.");
      return;
    }
    if (
      isEditing &&
      !passwordPlain.trim() &&
      serviceName === initialData?.serviceName &&
      username === (initialData?.username || "")
    ) {
      onClose();
      return;
    }
    onSubmit({
      serviceName: serviceName.trim(),
      username: username.trim() || undefined,
      passwordPlain: passwordPlain,
    });
  };

  const handleReveal = async () => {
    if (!initialData) return;
    setIsRevealing(true);
    const decrypted = await onRevealPassword(initialData);
    setIsRevealing(false);
    if (decrypted) {
      setRevealedPassword(decrypted);
    } else {
      Alert.alert("Error", "Could not decrypt password.");
    }
  };

  const handleDelete = () => {
    if (!initialData) return;
    Alert.alert(
      "Delete Password",
      `Are you sure you want to delete the password for "${initialData.serviceName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDeletePassword(initialData);
            onClose();
          },
        },
      ]
    );
  };

  const handleHardwareUnlock = () => {
    console.log(
      "Hardware unlock feature pressed for:",
      initialData?.serviceName
    );
    Alert.alert(
      "Feature in Development",
      "This feature will soon allow you to auto-fill your credentials using the hardware device."
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemedView style={styles.modalContent}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.modalHeader}>
                <ThemedText style={styles.modalTitle}>{modalTitle}</ThemedText>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Feather
                    name="x"
                    size={24}
                    color={Colors[colorScheme].icon}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
              >
                <TextInput
                  label="Service Name"
                  mode="outlined"
                  style={styles.input}
                  value={serviceName}
                  onChangeText={setServiceName}
                  autoCapitalize="words"
                />
                <TextInput
                  label="Username or Email"
                  mode="outlined"
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TextInput
                  label={isEditing ? "New Password" : "Password"}
                  mode="outlined"
                  style={styles.input}
                  placeholder={isEditing ? "Leave blank to keep the same" : ""}
                  secureTextEntry={!isPasswordVisible}
                  value={passwordPlain}
                  onChangeText={setPasswordPlain}
                  autoCapitalize="none"
                  right={
                    <TextInput.Icon
                      icon={isPasswordVisible ? "eye-off" : "eye"}
                      onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    />
                  }
                />

                {isEditing && (
                  <>
                    <Divider style={styles.divider} />

                    <PaperButton
                      mode="contained-tonal"
                      icon="lock-open-variant-outline"
                      onPress={handleHardwareUnlock}
                      style={styles.actionButton}
                    >
                      Unlock with Hardware
                    </PaperButton>

                    {revealedPassword ? (
                      <TextInput
                        label="Revealed Password"
                        mode="outlined"
                        value={revealedPassword}
                        editable={false}
                        style={[styles.input, { marginTop: 16 }]}
                        right={
                          <TextInput.Icon
                            icon="content-copy"
                            onPress={() => onCopyToClipboard(revealedPassword)}
                          />
                        }
                      />
                    ) : (
                      <PaperButton
                        mode="contained-tonal"
                        icon="eye"
                        onPress={handleReveal}
                        loading={isRevealing}
                        disabled={isRevealing}
                        style={styles.actionButton}
                      >
                        Reveal Saved Password
                      </PaperButton>
                    )}
                    <PaperButton
                      mode="contained"
                      icon="delete"
                      onPress={handleDelete}
                      buttonColor={Colors[colorScheme].notification}
                      textColor={paperTheme.colors.surface}
                      style={styles.actionButton}
                    >
                      Delete Entry
                    </PaperButton>
                  </>
                )}
              </ScrollView>

              <View style={styles.buttonContainer}>
                <PaperButton
                  mode="outlined"
                  onPress={onClose}
                  style={[styles.button, styles.cancelButton]}
                >
                  Cancel
                </PaperButton>
                <PaperButton
                  mode="contained"
                  onPress={handleSubmit}
                  style={[styles.button, styles.submitButton]}
                >
                  {submitButtonText}
                </PaperButton>
              </View>
            </SafeAreaView>
          </ThemedView>
        </GestureHandlerRootView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
