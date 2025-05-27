// components/PasswordListItem.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { PasswordEntry } from "@/types/vault"; //
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// Interface for the props that PasswordListItem will accept
interface PasswordListItemProps {
  item: PasswordEntry; // The password entry data
  isRevealed: boolean; // Whether the password for this item is currently revealed
  revealedPasswordText: string | null; // The decrypted password text, if revealed
  isLoading: boolean; // Global loading state to disable buttons
  isVaultLocked: boolean; // Vault lock state to disable buttons
  onTogglePasswordVisibility: (item: PasswordEntry) => void; // Function to toggle password visibility
  onOpenEditModal: (item: PasswordEntry) => void; // Function to open the edit modal
  onDeletePassword: (item: PasswordEntry) => void; // Function to delete the password
  onCopyToClipboard: (text: string) => void; // Function to copy text to clipboard
}

export function PasswordListItem({
  item,
  isRevealed,
  revealedPasswordText,
  isLoading,
  isVaultLocked,
  onTogglePasswordVisibility,
  onOpenEditModal,
  onDeletePassword,
  onCopyToClipboard,
}: PasswordListItemProps) {
  const colorScheme = useColorScheme() ?? "light";

  // Styles that depend on the color scheme or props like isLoading/isVaultLocked
  const themedStyles = {
    actionButtonColor:
      isLoading || isVaultLocked
        ? Colors[colorScheme].icon // Dimmed color when disabled
        : Colors[colorScheme].tint, // Active color
    deleteButtonColor:
      isLoading || isVaultLocked ? Colors[colorScheme].icon : "#FF6347", // Specific color for delete action
    copyButtonColor: Colors[colorScheme].tint,
  };

  return (
    <ThemedView style={styles.itemOuterContainer}>
      {/* Main content area of the item (service name, username, revealed password) */}
      <View style={styles.itemContentContainer}>
        <View style={styles.itemTextContainer}>
          <ThemedText style={styles.itemText}>{item.serviceName}</ThemedText>
          {item.username && (
            <ThemedText style={styles.itemUsernameText}>
              {item.username}
            </ThemedText>
          )}
          {/* Conditionally render the revealed password */}
          {isRevealed && revealedPasswordText && (
            <View style={styles.revealedPasswordContainer}>
              <ThemedText style={styles.revealedPasswordText}>
                {revealedPasswordText}
              </ThemedText>
              <TouchableOpacity
                onPress={() => onCopyToClipboard(revealedPasswordText)}
                style={styles.copyButton}
              >
                <Feather
                  name="copy"
                  size={18}
                  color={themedStyles.copyButtonColor}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Action buttons (Reveal, Edit, Delete) */}
      <View style={styles.itemActions}>
        <TouchableOpacity
          onPress={() => onTogglePasswordVisibility(item)}
          style={styles.actionButton}
          disabled={isLoading || isVaultLocked}
        >
          <Feather
            name={isRevealed ? "eye-off" : "eye"}
            size={20}
            color={themedStyles.actionButtonColor}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onOpenEditModal(item)}
          style={styles.actionButton}
          disabled={isLoading || isVaultLocked}
        >
          <Feather
            name="edit-2"
            size={20}
            color={themedStyles.actionButtonColor}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDeletePassword(item)}
          style={styles.actionButton}
          disabled={isLoading || isVaultLocked}
        >
          <Feather
            name="trash-2"
            size={20}
            color={themedStyles.deleteButtonColor}
          />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

// Styles for the PasswordListItem component
// These styles are extracted from the original vault.tsx
const styles = StyleSheet.create({
  itemOuterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
    marginVertical: 6,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  itemContentContainer: {
    flex: 1,
    marginRight: 10,
  },
  itemTextContainer: {
    // No specific styles needed here, children will define their own
  },
  itemText: { fontSize: 18, fontWeight: "bold" },
  itemUsernameText: { fontSize: 14, opacity: 0.7, marginTop: 3 },
  revealedPasswordContainer: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: "rgba(128,128,128,0.1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  revealedPasswordText: {
    fontSize: 15,
    flexShrink: 1,
  },
  copyButton: {
    marginLeft: 10,
    padding: 5,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
});
