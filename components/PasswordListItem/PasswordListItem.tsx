// components/PasswordListItem.tsx
import { ThemedText } from "@/components/ThemedText/ThemedText";
import { PasswordEntry } from "@/types/vault";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Card } from "react-native-paper";
import { styles } from "./passwordListItem.styles";

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
