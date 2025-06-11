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
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
// 1. Import Button and TextInput from react-native-paper
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Button as PaperButton, TextInput } from "react-native-paper";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface PasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: PasswordFormData) => void;
  initialData?: PasswordEntry | null;
}

export function PasswordModal({
  visible,
  onClose,
  onSubmit,
  initialData,
}: PasswordModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const [serviceName, setServiceName] = useState("");
  const [username, setUsername] = useState("");
  const [passwordPlain, setPasswordPlain] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const isEditing = !!initialData;
  const modalTitle = isEditing ? "Edit Password" : "Add New Password";
  const submitButtonText = isEditing ? "Save Changes" : "Add Password";

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setServiceName(initialData.serviceName);
        setUsername(initialData.username || "");
        setPasswordPlain("");
        setIsPasswordVisible(false);
      } else {
        setServiceName("");
        setUsername("");
        setPasswordPlain("");
        setIsPasswordVisible(false);
      }
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

  const themedStyles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "transparent",
    },
    modalContent: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 15,
      paddingTop: 10,
      paddingBottom: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: Colors[colorScheme].icon,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: Colors[colorScheme].text,
    },
    scrollContainer: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    // 5. Simplified input style
    input: {
      marginBottom: 16,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      padding: 20,
    },
    button: {
      flex: 1,
    },
    cancelButton: {
      marginRight: 8,
    },
    submitButton: {
      marginLeft: 8,
    },
    closeButton: {
      padding: 5,
    },
  });

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={themedStyles.modalOverlay}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemedView style={themedStyles.modalContent}>
            <SafeAreaView style={{ flex: 1 }}>
              <View style={themedStyles.modalHeader}>
                <ThemedText style={themedStyles.modalTitle}>
                  {modalTitle}
                </ThemedText>
                <TouchableOpacity
                  style={themedStyles.closeButton}
                  onPress={onClose}
                >
                  <Feather
                    name="x"
                    size={24}
                    color={Colors[colorScheme].icon}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={themedStyles.scrollContainer}
                keyboardShouldPersistTaps="handled"
              >
                {/* 2. Replace all inputs with Paper's TextInput */}
                <TextInput
                  label="Service Name (e.g., Google, Facebook)"
                  mode="outlined"
                  style={themedStyles.input}
                  value={serviceName}
                  onChangeText={setServiceName}
                  autoCapitalize="words"
                />
                <TextInput
                  label="Username or Email (optional)"
                  mode="outlined"
                  style={themedStyles.input}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TextInput
                  label="Password"
                  mode="outlined"
                  style={themedStyles.input}
                  secureTextEntry={!isPasswordVisible}
                  value={passwordPlain}
                  onChangeText={setPasswordPlain}
                  autoCapitalize="none"
                  // 4. Use the 'right' prop for the icon
                  right={
                    <TextInput.Icon
                      icon={isPasswordVisible ? "eye-off" : "eye"}
                      onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    />
                  }
                />
              </ScrollView>

              {/* 3. Replaced TouchableOpacity with PaperButton */}
              <View style={themedStyles.buttonContainer}>
                <PaperButton
                  mode="outlined"
                  onPress={onClose}
                  style={[themedStyles.button, themedStyles.cancelButton]}
                >
                  Cancel
                </PaperButton>
                <PaperButton
                  mode="contained"
                  onPress={handleSubmit}
                  style={[themedStyles.button, themedStyles.submitButton]}
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
