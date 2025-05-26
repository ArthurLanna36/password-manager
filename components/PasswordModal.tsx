// components/PasswordModal.tsx
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { PasswordEntry, PasswordFormData } from "@/types/vault";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
// Importe GestureHandlerRootView e TextInput de react-native-gesture-handler
import {
  GestureHandlerRootView, // <<< ADICIONE ESTE IMPORT
  TextInput,
} from "react-native-gesture-handler";
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

  const isEditing = !!initialData;
  const modalTitle = isEditing ? "Editar Senha" : "Adicionar Nova Senha";
  const submitButtonText = isEditing ? "Salvar Alterações" : "Adicionar Senha";

  useEffect(() => {
    console.log(
      "[PasswordModal] useEffect triggered. Visible:",
      visible,
      "InitialData:",
      JSON.stringify(initialData, null, 2)
    );
    if (visible) {
      if (initialData) {
        console.log("[PasswordModal] Editing mode. Setting form data.");
        try {
          console.log(
            "[PasswordModal] Accessing initialData.serviceName:",
            initialData.serviceName
          );
          setServiceName(initialData.serviceName);
          console.log(
            "[PasswordModal] Accessing initialData.username:",
            initialData.username
          );
          setUsername(initialData.username || "");
        } catch (e: any) {
          console.error(
            "[PasswordModal] Error accessing properties of initialData:",
            e.message,
            initialData
          );
        }
        setPasswordPlain("");
      } else {
        console.log("[PasswordModal] Add mode. Resetting form data.");
        setServiceName("");
        setUsername("");
        setPasswordPlain("");
      }
    }
  }, [visible, initialData]);

  const handleSubmit = () => {
    if (!serviceName.trim() || !passwordPlain.trim()) {
      console.error("Nome do Serviço e Senha são obrigatórios.");
      return;
    }
    onSubmit({
      serviceName,
      username: username.trim() || undefined,
      passwordPlain,
    });
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
    },
    // Adicione um estilo para o GestureHandlerRootView dentro do modal
    gestureHandlerRootModal: {
      width: "90%", // Mesma largura do modalContent
      // Outros estilos se necessário para alinhar ou conter o modalContent
      // Geralmente, apenas width/height ou flex são necessários aqui.
    },
    modalContent: {
      // width: "90%", // Removido pois será controlado pelo gestureHandlerRootModal
      backgroundColor: Colors[colorScheme].background, // Definindo explicitamente aqui
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
      color: Colors[colorScheme].text, // Adicionado para consistência
    },
    input: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].icon,
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 12,
      marginBottom: 15,
      fontSize: 16,
      color: Colors[colorScheme].text,
      backgroundColor: Colors[colorScheme].background, // Pode ser redundante se modalContent já tiver
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 20,
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 8,
      alignItems: "center",
      minWidth: 120,
    },
    submitButton: {
      backgroundColor: Colors[colorScheme].tint,
    },
    cancelButton: {
      backgroundColor: Colors[colorScheme].icon,
    },
    buttonText: {
      color: Colors[colorScheme].background,
      fontSize: 16,
      fontWeight: "600",
    },
    closeButton: {
      position: "absolute",
      top: 10,
      right: 10,
      padding: 5,
      zIndex: 1,
    },
  });

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        {/* Envolva o ThemedView (que é o modalContent) com GestureHandlerRootView */}
        <GestureHandlerRootView style={styles.gestureHandlerRootModal}>
          <ThemedView style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Feather name="x" size={24} color={Colors[colorScheme].text} />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>{modalTitle}</ThemedText>
            <ScrollView keyboardShouldPersistTaps="handled">
              <TextInput
                style={styles.input}
                placeholder="Nome do Serviço"
                placeholderTextColor={Colors[colorScheme].icon}
                value={serviceName}
                onChangeText={setServiceName}
              />
              <TextInput
                style={styles.input}
                placeholder="Nome de Usuário (opcional)"
                placeholderTextColor={Colors[colorScheme].icon}
                value={username}
                onChangeText={setUsername}
              />
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={Colors[colorScheme].icon}
                secureTextEntry
                value={passwordPlain}
                onChangeText={setPasswordPlain}
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                >
                  <ThemedText style={styles.buttonText}>Cancelar</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSubmit}
                >
                  <ThemedText style={styles.buttonText}>
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
