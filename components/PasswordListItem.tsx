// components/PasswordListItem.tsx
import { ThemedText } from "@/components/ThemedText";
import { PasswordEntry } from "@/types/vault";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
// 1. Import Card from react-native-paper
import { Card } from "react-native-paper";

interface PasswordListItemProps {
  item: PasswordEntry;
  onPress: (item: PasswordEntry) => void;
}

export function PasswordListItem({ item, onPress }: PasswordListItemProps) {
  return (
    <TouchableOpacity onPress={() => onPress(item)}>
      {/* 2. Replaced ThemedView with Card component */}
      <Card style={styles.card}>
        {/* 3. Used Card.Content for consistent padding */}
        <Card.Content>
          <ThemedText style={styles.itemText}>{item.serviceName}</ThemedText>
          {item.username && (
            <ThemedText style={styles.itemUsernameText}>
              {item.username}
            </ThemedText>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}

// 4. Standardized styles
const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  itemText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemUsernameText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 3,
  },
});
