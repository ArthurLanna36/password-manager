// app/(tabs)/_layout.tsx
import { Colors } from "@/constants/Colors"; // Importar Colors
import { supabase } from "@/constants/supabase";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Feather } from "@expo/vector-icons"; // Mantido para ícones
import { Tabs, useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

export default function TabsLayout() {
  const colorScheme = useColorScheme() ?? "light";
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login-page");
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint, // Usar a cor de tint definida
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme].background,
        },
        headerStyle: {
          backgroundColor: Colors[colorScheme].background,
        },
        headerTintColor: Colors[colorScheme].text,
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index" // app/(tabs)/index.tsx
        options={{
          title: "Home", // Título da Aba
          headerTitle: "Home", // Título do Header
          headerRight: () => (
            <TouchableOpacity
              onPress={handleLogout}
              style={{ marginRight: 16 }}
            >
              <Feather
                name="log-out"
                size={24}
                color={Colors[colorScheme].text} // Usar a cor de texto do tema
              />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="home"
              size={28}
              color={focused ? Colors[colorScheme].tint : color}
            />
          ),
        }}
      />

      {/* Vault Tab (Antiga first-tab) */}
      <Tabs.Screen
        name="vault" // Nome do arquivo: app/(tabs)/vault.tsx
        options={{
          title: "Vault", // Título da Aba
          headerTitle: "Seu Cofre", // Título do Header
          headerRight: () => (
            <TouchableOpacity
              onPress={handleLogout} // Mantém o logout, mas pode ser alterado
              style={{ marginRight: 16 }}
            >
              <Feather
                name="log-out"
                size={24}
                color={Colors[colorScheme].text} // Usar a cor de texto do tema
              />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="shield" // Ícone de cofre/segurança
              size={28}
              color={focused ? Colors[colorScheme].tint : color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
