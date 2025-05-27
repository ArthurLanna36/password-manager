// components/PasswordModal.tsx
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { PasswordEntry, PasswordFormData } from "@/types/vault"; // Ensure this path is correct
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  TextInput,
} from "react-native-gesture-handler";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface PasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: PasswordFormData) => void;
  initialData?: PasswordEntry | null; // For editing existing entries
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // New state for password visibility

  const isEditing = !!initialData;
  const modalTitle = isEditing ? "Edit Password" : "Add New Password";
  const submitButtonText = isEditing ? "Save Changes" : "Add Password";

  useEffect(() => {
    // Effect to populate form when modal becomes visible for editing,
    // or reset form when opening for a new entry.
    if (visible) {
      if (initialData) {
        // Editing mode: set form fields from initialData
        console.log(
          "[PasswordModal] Opening in Edit Mode for:",
          initialData.serviceName
        );
        setServiceName(initialData.serviceName);
        setUsername(initialData.username || "");
        setPasswordPlain(""); // Password field is cleared for security when editing
        setIsPasswordVisible(false); // Reset visibility when opening
      } else {
        // Add mode: reset form fields
        console.log("[PasswordModal] Opening in Add Mode.");
        setServiceName("");
        setUsername("");
        setPasswordPlain("");
        setIsPasswordVisible(false); // Reset visibility when opening
      }
    }
  }, [visible, initialData]); // Re-run effect if visibility or initialData changes

  const handleSubmit = () => {
    Keyboard.dismiss(); // Dismiss keyboard on submit
    if (!serviceName.trim()) {
      Alert.alert("Validation Error", "Service Name is required.");
      return;
    }
    // If not editing, password is required.
    // If editing and a new password was typed, it's required.
    if (!isEditing && !passwordPlain.trim()) {
      Alert.alert("Validation Error", "Password is required.");
      return;
    }
    // If editing, but NOTHING was changed (including password which remains empty in the field)
    if (
      isEditing &&
      !passwordPlain.trim() && // No new password typed
      serviceName === initialData?.serviceName &&
      username === (initialData?.username || "")
    ) {
      Alert.alert("No Changes", "No changes were made to save.");
      onClose(); // Close modal if no changes
      return;
    }

    onSubmit({
      serviceName: serviceName.trim(),
      username: username.trim() || undefined, // Send undefined if empty for Supabase to store as NULL
      passwordPlain: passwordPlain, // Send password as is (can be empty if editing and not changed)
    });
    // The onSubmit callback (in VaultScreen) is responsible for closing the modal upon successful submission.
  };

  // Dynamic styles based on color scheme
  const themedStyles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
    gestureHandlerRootModal: {
      width: "90%",
      maxHeight: "80%", // Ensure modal doesn't get too tall
    },
    modalContent: {
      backgroundColor: Colors[colorScheme].background,
      borderRadius: 10,
      padding: 20,
      elevation: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
      color: Colors[colorScheme].text,
    },
    input: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: Platform.OS === "ios" ? 15 : 12,
      marginBottom: 15,
      fontSize: 16,
      color: Colors[colorScheme].text,
      backgroundColor: Colors[colorScheme].background,
    },
    // New style for the password input container
    passwordInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      marginBottom: 15,
      backgroundColor: Colors[colorScheme].background,
    },
    passwordInput: {
      // Style for the TextInput within the container
      flex: 1, // To take up remaining space
      paddingHorizontal: 15,
      paddingVertical: Platform.OS === "ios" ? 15 : 12,
      fontSize: 16,
      color: Colors[colorScheme].text,
      // Remove individual borders as the container already has them
    },
    eyeIcon: {
      // Style for the touchable area of the icon
      padding: 10,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-around", // Or 'flex-end' with spacing
      marginTop: 20,
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 20, // Adjusted for better fit
      borderRadius: 8,
      alignItems: "center",
      flex: 1, // Make buttons share space
    },
    submitButton: {
      backgroundColor: Colors[colorScheme].tint,
      marginLeft: 10, // Space between buttons
    },
    cancelButton: {
      backgroundColor: Colors[colorScheme].icon,
      marginRight: 10, // Space between buttons
    },
    buttonText: {
      // Text color for buttons should contrast with button background
      color:
        colorScheme === "light"
          ? Colors.light.background
          : Colors.dark.background,
      fontSize: 16,
      fontWeight: "600",
    },
    buttonTextSubmit: {
      // Specific for submit button if its background is tint
      color: Colors[colorScheme].background, // Text color for submit button
    },
    buttonTextCancel: {
      // Specific for cancel if its background is icon color
      color: Colors[colorScheme].text, // Text color for cancel (assuming icon color is darker than text)
    },
    closeButton: {
      position: "absolute",
      top: 15, // Adjusted for better padding
      right: 15, // Adjusted for better padding
      padding: 5,
      zIndex: 1,
    },
  });

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} // For Android back button
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={themedStyles.modalOverlay}
      >
        <GestureHandlerRootView style={themedStyles.gestureHandlerRootModal}>
          <ThemedView style={themedStyles.modalContent}>
            <TouchableOpacity
              style={themedStyles.closeButton}
              onPress={onClose}
            >
              <Feather name="x" size={24} color={Colors[colorScheme].icon} />
            </TouchableOpacity>
            <ThemedText style={themedStyles.modalTitle}>
              {modalTitle}
            </ThemedText>
            <ScrollView keyboardShouldPersistTaps="handled">
              <TextInput
                style={themedStyles.input}
                placeholder="Service Name (e.g., Google, Facebook)"
                placeholderTextColor={Colors[colorScheme].icon}
                value={serviceName}
                onChangeText={setServiceName}
                autoCapitalize="none"
              />
              <TextInput
                style={themedStyles.input}
                placeholder="Username or Email (optional)"
                placeholderTextColor={Colors[colorScheme].icon}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {/* Password input field modification */}
              <View style={themedStyles.passwordInputContainer}>
                <TextInput
                  style={themedStyles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor={Colors[colorScheme].icon}
                  secureTextEntry={!isPasswordVisible} // Controlled by state
                  value={passwordPlain}
                  onChangeText={setPasswordPlain}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={themedStyles.eyeIcon}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <Feather
                    name={isPasswordVisible ? "eye-off" : "eye"} // Toggles icon
                    size={22}
                    color={Colors[colorScheme].icon}
                  />
                </TouchableOpacity>
              </View>
              {/* End of password input field modification */}
              <View style={themedStyles.buttonContainer}>
                <TouchableOpacity
                  style={[themedStyles.button, themedStyles.cancelButton]}
                  onPress={onClose}
                >
                  {/* Adjust text color based on button background for better contrast */}
                  <ThemedText
                    style={[
                      themedStyles.buttonText,
                      themedStyles.buttonTextCancel,
                    ]}
                  >
                    Cancel
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[themedStyles.button, themedStyles.submitButton]}
                  onPress={handleSubmit}
                >
                  <ThemedText
                    style={[
                      themedStyles.buttonText,
                      themedStyles.buttonTextSubmit,
                    ]}
                  >
                    {submitButtonText}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </ThemedView>
        </GestureHandlerRootView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
