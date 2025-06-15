import { ThemedText } from "@/components/ThemedText/ThemedText";
import { PasswordEntry } from "@/types/vault";
import { Image } from "expo-image";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Card } from "react-native-paper";
import { styles } from "./passwordListItem.styles";

interface PasswordListItemProps {
  item: PasswordEntry;
  onPress: (item: PasswordEntry) => void;
}

export function PasswordListItem({ item, onPress }: PasswordListItemProps) {
  const faviconUrl = item.website
    ? `https://www.google.com/s2/favicons?domain=${item.website}&sz=64`
    : null;

  return (
    <TouchableOpacity onPress={() => onPress(item)}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          {faviconUrl && (
            <Image
              source={{ uri: faviconUrl }}
              style={styles.favicon}
              placeholder={{ blurhash: "L6PZfSi_.OAyV@RjWBt600I_SoNG" }}
              transition={300}
            />
          )}
          <View style={styles.textContainer}>
            <ThemedText style={styles.itemText}>{item.serviceName}</ThemedText>
            {item.username && (
              <ThemedText style={styles.itemUsernameText}>
                {item.username}
              </ThemedText>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
}
