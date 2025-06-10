// app/(tabs)/settings.tsx
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Appearance, StyleSheet } from "react-native";
import { Divider, List, useTheme } from "react-native-paper";

import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/constants/supabase";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const paperTheme = useTheme();

  // Lógica para deslogar o usuário
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login-page");
  };

  // Lógica para alternar o tema
  const toggleTheme = () => {
    const nextColorScheme = colorScheme === "dark" ? "light" : "dark";
    Appearance.setColorScheme(nextColorScheme);
  };

  const menuTextColor = Colors[colorScheme].text;
  const logoutColor =
    Colors[colorScheme].tint === Colors.dark.tint ? "#FF6B6B" : "#D32F2F";

  return (
    <ThemedView style={styles.container}>
      <List.Section>
        <List.Subheader>Aparência</List.Subheader>
        <List.Item
          title={`Mudar para modo ${
            colorScheme === "dark" ? "Claro" : "Escuro"
          }`}
          left={() => (
            <List.Icon
              icon={({ size, color }) => (
                <Feather
                  name={colorScheme === "dark" ? "sun" : "moon"}
                  size={size}
                  color={color}
                />
              )}
            />
          )}
          onPress={toggleTheme}
          titleStyle={{ color: menuTextColor }}
        />
      </List.Section>
      <Divider />
      <List.Section>
        <List.Subheader>Conta</List.Subheader>
        <List.Item
          title="Sair"
          left={() => (
            <List.Icon
              icon={({ size }) => (
                <Feather name="log-out" size={size} color={logoutColor} />
              )}
            />
          )}
          onPress={handleLogout}
          titleStyle={{ color: logoutColor }}
        />
      </List.Section>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
