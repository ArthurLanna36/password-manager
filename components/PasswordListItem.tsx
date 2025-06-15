// components/PasswordListItem.tsx
import { ThemedText } from "@/components/ThemedText";
import { PasswordEntry } from "@/types/vault";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Card } from "react-native-paper";

interface PasswordListItemProps {
  item: PasswordEntry;
  onPress: (item: PasswordEntry) => void;
}

export function PasswordListItem({ item, onPress }: PasswordListItemProps) {
  return (
    <TouchableOpacity onPress={() => onPress(item)}>
      <Card style={styles.card}>
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
