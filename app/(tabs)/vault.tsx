// app/(tabs)/vault.tsx
import { PasswordModal } from "@/components/PasswordModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { PasswordEntry, PasswordFormData } from "@/types/vault";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const MOCKED_PASSWORDS: PasswordEntry[] = [
  {
    id: "1",
    serviceName: "Serviço Exemplo 1",
    username: "usuario_ex1",
    passwordEncrypted: "placeholder_encrypted_1",
    createdAt: new Date(2023, 0, 15).toISOString(),
    updatedAt: new Date(2023, 0, 20).toISOString(),
  },
  {
    id: "2",
    serviceName: "Aplicativo Teste 2",
    passwordEncrypted: "placeholder_encrypted_2",
    createdAt: new Date(2023, 1, 10).toISOString(),
    updatedAt: new Date(2023, 1, 12).toISOString(),
  },
  {
    id: "3",
    serviceName: "Site Importante 3",
    username: "outro_user",
    passwordEncrypted: "placeholder_encrypted_3",
    createdAt: new Date(2023, 2, 5).toISOString(),
    updatedAt: new Date(2023, 2, 5).toISOString(),
  },
];

export default function VaultScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const [passwords, setPasswords] = useState<PasswordEntry[]>(MOCKED_PASSWORDS);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(
    null
  );

  useEffect(() => {
    console.log(
      "[VaultScreen] Initial passwords state:",
      JSON.stringify(passwords, null, 2)
    );
    if (passwords.length === 0 && MOCKED_PASSWORDS.length > 0) {
      // Ajuste na condição
      console.warn(
        "[VaultScreen] Passwords array is empty but MOCKED_PASSWORDS is not. Check initialization."
      );
    }
  }, []);

  const handleOpenAddModal = () => {
    setEditingPassword(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (item: PasswordEntry) => {
    // --- INÍCIO DO LOG IMPORTANTE ---
    console.log(
      "[VaultScreen] handleOpenEditModal, item:",
      JSON.stringify(item, null, 2) // Usar JSON.stringify para ver o objeto completo
    );
    // --- FIM DO LOG IMPORTANTE ---
    setEditingPassword(item);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingPassword(null);
  };

  const handleModalSubmit = (data: PasswordFormData) => {
    if (editingPassword) {
      setPasswords((prevPasswords) =>
        prevPasswords.map((p) =>
          p.id === editingPassword.id
            ? {
                ...p,
                serviceName: data.serviceName,
                username: data.username || undefined,
                passwordEncrypted: `encrypted_plain_${data.passwordPlain.substring(
                  0,
                  5
                )}_${Date.now()}`,
                updatedAt: new Date().toISOString(),
              }
            : p
        )
      );
      Alert.alert(
        "Senha Atualizada",
        `Senha para "${data.serviceName}" atualizada localmente.`
      );
    } else {
      const newPassword: PasswordEntry = {
        id: String(Date.now() + Math.random()),
        serviceName: data.serviceName,
        username: data.username || undefined,
        passwordEncrypted: `encrypted_plain_${data.passwordPlain.substring(
          0,
          5
        )}_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPasswords((prevPasswords) => [newPassword, ...prevPasswords]);
      Alert.alert(
        "Senha Adicionada",
        `Senha para "${data.serviceName}" adicionada localmente.`
      );
    }
    handleModalClose();
  };

  const handleDeletePassword = (itemToDelete: PasswordEntry) => {
    Alert.alert(
      "Excluir Senha",
      `Tem certeza que deseja excluir a senha para "${itemToDelete.serviceName}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            setPasswords((prevPasswords) =>
              prevPasswords.filter((p) => p.id !== itemToDelete.id)
            );
            Alert.alert(
              "Senha Excluída",
              `Senha para "${itemToDelete.serviceName}" excluída localmente.`
            );
          },
        },
      ]
    );
  };

  const renderPasswordItem = ({ item }: { item: PasswordEntry }) => {
    return (
      <View style={styles.itemOuterContainer}>
        <TouchableOpacity
          style={styles.itemContentContainer}
          onPress={() =>
            Alert.alert(
              item.serviceName,
              `Usuário: ${item.username || "N/A"}\nSenha (placeholder): ${
                item.passwordEncrypted
              }\nCriado em: ${new Date(
                item.createdAt
              ).toLocaleDateString()}\nAtualizado em: ${new Date(
                item.updatedAt
              ).toLocaleDateString()}`
            )
          }
        >
          <View style={styles.itemTextContainer}>
            <ThemedText style={styles.itemText}>{item.serviceName}</ThemedText>
            {item.username && (
              <ThemedText style={styles.itemUsernameText}>
                {item.username}
              </ThemedText>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.itemActions}>
          <TouchableOpacity
            onPress={() => handleOpenEditModal(item)} // Certifique-se que 'item' aqui é o correto
            style={styles.actionButton}
          >
            <Feather name="edit-2" size={20} color={Colors[colorScheme].tint} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeletePassword(item)}
            style={styles.actionButton}
          >
            <Feather name="trash-2" size={20} color={"#FF6347"} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {passwords.length > 0 ? (
        <FlatList
          data={passwords}
          renderItem={renderPasswordItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <ThemedText style={styles.emptyText}>
            Nenhuma senha salva ainda.
          </ThemedText>
          <ThemedText style={styles.emptySubText}>
            Toque em '+' para adicionar.
          </ThemedText>
        </View>
      )}
      <TouchableOpacity
        style={[
          styles.addButton,
          { backgroundColor: Colors[colorScheme].tint },
        ]}
        onPress={handleOpenAddModal}
      >
        <Feather name="plus" size={30} color={Colors[colorScheme].background} />
      </TouchableOpacity>

      <PasswordModal
        visible={modalVisible}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={editingPassword}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContentContainer: {
    paddingBottom: 90,
    paddingTop: 10,
  },
  itemOuterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
    marginVertical: 5,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#2C2C2E",
  },
  itemContentContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemTextContainer: {},
  itemText: {
    fontSize: 18,
    fontWeight: "600",
  },
  itemUsernameText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  itemDate: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 60,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 17,
    opacity: 0.8,
  },
  emptySubText: {
    textAlign: "center",
    fontSize: 14,
    opacity: 0.6,
    marginTop: 8,
  },
  addButton: {
    position: "absolute",
    right: 25,
    bottom: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});
