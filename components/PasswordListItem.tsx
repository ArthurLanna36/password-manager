// components/PasswordListItem.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { PasswordEntry } from "@/types/vault";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// 1. Simplified props. The component only needs to know what to do when pressed.
interface PasswordListItemProps {
  item: PasswordEntry;
  onPress: (item: PasswordEntry) => void;
}

export function PasswordListItem({ item, onPress }: PasswordListItemProps) {
  return (
    // 2. The entire item is now a TouchableOpacity.
    <TouchableOpacity onPress={() => onPress(item)}>
      <ThemedView style={styles.itemOuterContainer}>
        <View style={styles.itemContentContainer}>
          <ThemedText style={styles.itemText}>{item.serviceName}</ThemedText>
          {item.username && (
            <ThemedText style={styles.itemUsernameText}>
              {item.username}
            </ThemedText>
          )}
        </View>
        {/* 3. All action icons have been removed. */}
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemOuterContainer: {
    marginHorizontal: 15,
    marginVertical: 6,
    paddingVertical: 16,
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
  itemText: { fontSize: 18, fontWeight: "bold" },
  itemUsernameText: { fontSize: 14, opacity: 0.7, marginTop: 3 },
});
