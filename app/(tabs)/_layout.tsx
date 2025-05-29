import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import {
  Appbar,
  BottomNavigation,
  Text as PaperText,
  useTheme,
} from "react-native-paper";

import GeneratorScreen from "./generator";
import HomeScreen from "./index";
import VaultScreen from "./vault";

import { Colors } from "@/constants/Colors";
import { supabase } from "@/constants/supabase";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const paperTheme = useTheme();

  const [index, setIndex] = useState(0);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login-page");
  };

  const [routes] = useState([
    {
      key: "home",
      title: "Home",
      tabBarLabel: "Home",
      focusedIcon: ({ color, size }: { color: string; size: number }) => (
        <Feather name="home" size={size} color={color} />
      ),
      unfocusedIcon: ({ color, size }: { color: string; size: number }) => (
        <Feather name="home" size={size} color={color} />
      ),
    },
    {
      key: "vault",
      title: "Your Vault",
      tabBarLabel: "Vault",
      focusedIcon: ({ color, size }: { color: string; size: number }) => (
        <Feather name="shield" size={size} color={color} />
      ),
      unfocusedIcon: ({ color, size }: { color: string; size: number }) => (
        <Feather name="shield" size={size} color={color} />
      ),
    },
    {
      key: "generator",
      title: "Password Generator",
      tabBarLabel: "Generator",
      focusedIcon: ({ color, size }: { color: string; size: number }) => (
        <Feather name="key" size={size} color={color} />
      ),
      unfocusedIcon: ({ color, size }: { color: string; size: number }) => (
        <Feather name="key" size={size} color={color} />
      ),
    },
  ]);

  const renderScene = BottomNavigation.SceneMap({
    home: HomeScreen,
    vault: VaultScreen,
    generator: GeneratorScreen,
  });

  const currentRouteTitle = routes[index].title;

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header
        style={{ backgroundColor: paperTheme.colors.elevation.level2 }}
      >
        <Appbar.Content
          title={currentRouteTitle}
          titleStyle={{ color: Colors[colorScheme].text }}
        />
        <Appbar.Action
          icon="logout"
          onPress={handleLogout}
          color={Colors[colorScheme].tint}
        />
      </Appbar.Header>
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        shifting={false} // True for shifting animation, and false for fixed tabs
        barStyle={{ backgroundColor: paperTheme.colors.elevation.level2 }}
        activeColor={Colors[colorScheme].tint}
        inactiveColor={Colors[colorScheme].tabIconDefault}
        renderLabel={({ route, color }) => (
          <PaperText style={{ color, fontSize: 12, textAlign: "center" }}>
            {route.tabBarLabel}
          </PaperText>
        )}
      />
    </View>
  );
}
