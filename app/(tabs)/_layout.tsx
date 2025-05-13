// app/(tabs)/_layout.tsx
import { supabase } from "@/constants/supabase";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Feather } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // sign out and go back to login-page
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login-page");
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === "dark" ? "#fff" : "#000",
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index" // app/(tabs)/index.tsx
        options={{
          headerShown: true,
          headerTitle: "Home",
          headerRight: () => (
            <TouchableOpacity
              onPress={handleLogout}
              style={{ marginRight: 16 }}
            >
              <Feather
                name="log-out"
                size={24}
                color={colorScheme === "dark" ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      {/* First Tab */}
      <Tabs.Screen
        name="first-tab" // app/(tabs)/first-tab.tsx
        options={{
          headerShown: true,
          headerTitle: "First Tab",
          headerRight: () => (
            <TouchableOpacity
              onPress={handleLogout}
              style={{ marginRight: 16 }}
            >
              <Feather
                name="log-out"
                size={24}
                color={colorScheme === "dark" ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, size }) => (
            <Feather name="compass" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
