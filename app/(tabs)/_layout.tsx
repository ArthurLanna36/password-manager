// app/(tabs)/_layout.tsx
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Appearance, View } from "react-native"; // Import Appearance
import {
  Appbar,
  BottomNavigation,
  Divider,
  Menu,
  Text as PaperText,
  useTheme,
} from "react-native-paper";

import GeneratorScreen from "./generator";
import HomeScreen from "./index";
import VaultScreen from "./vault";

import { Colors } from "@/constants/Colors";
import { supabase } from "@/constants/supabase";
import {
  GeneratorProvider,
  useGeneratorContext,
} from "@/contexts/GeneratorContext";
import { useColorScheme } from "@/hooks/useColorScheme";

// Inner component to access context within the provider's scope
function TabLayoutContent() {
  const router = useRouter();
  let colorScheme = useColorScheme() ?? "light"; // Use let for reassignment if needed by toggle
  const paperTheme = useTheme(); // This hook will give theme based on PaperProvider
  const [index, setIndex] = useState(0);
  const [settingsMenuVisible, setSettingsMenuVisible] = useState(false);

  const { setNeedsClear, clearPasswordAction } = useGeneratorContext();

  const openSettingsMenu = () => setSettingsMenuVisible(true);
  const closeSettingsMenu = () => setSettingsMenuVisible(false);

  const handleLogout = async () => {
    closeSettingsMenu();
    await supabase.auth.signOut();
    router.replace("/login-page");
  };

  const toggleTheme = () => {
    closeSettingsMenu();
    const nextColorScheme = colorScheme === "dark" ? "light" : "dark";
    Appearance.setColorScheme(nextColorScheme);
    // Note: The component might need to re-render for `colorScheme` variable to update.
    // `useColorScheme()` hook should trigger a re-render in components using it.
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
  const generatorRouteKey = "generator";

  const handleIndexChange = (newIndex: number) => {
    const previousRouteKey = routes[index].key;
    if (previousRouteKey === generatorRouteKey && newIndex !== index) {
      if (clearPasswordAction) {
        clearPasswordAction();
      } else {
        setNeedsClear(true);
      }
    }
    setIndex(newIndex);
  };

  // Get the current theme's text color for menu items
  const menuTextColor = Colors[colorScheme].text;
  const logoutColor =
    Colors[colorScheme].tint === Colors.dark.tint ? "#FF6B6B" : "#D32F2F"; // Softer red for dark, stronger for light

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header
        style={{ backgroundColor: paperTheme.colors.elevation.level2 }}
      >
        <Appbar.Content
          title={currentRouteTitle}
          titleStyle={{ color: Colors[colorScheme].text }}
        />
        <Menu
          visible={settingsMenuVisible}
          onDismiss={closeSettingsMenu}
          anchor={
            <Appbar.Action
              icon="cog"
              color={Colors[colorScheme].tint}
              onPress={openSettingsMenu}
            />
          }
          // ContentStyle might be needed if menu background needs to match app background
          // contentStyle={{ backgroundColor: paperTheme.colors.background }}
        >
          <Menu.Item
            onPress={toggleTheme}
            title={`Switch to ${
              colorScheme === "dark" ? "Light" : "Dark"
            } Mode`}
            leadingIcon={(
              { size } // color prop is provided by Menu.Item, we use dynamic color
            ) => (
              <Feather
                name={colorScheme === "dark" ? "sun" : "moon"}
                size={size}
                color={menuTextColor}
              />
            )}
            titleStyle={{ color: menuTextColor }}
          />
          <Divider />
          <Menu.Item
            onPress={handleLogout}
            title="Logout"
            leadingIcon={({ size }) => (
              <Feather name="log-out" size={size} color={logoutColor} />
            )}
            titleStyle={{ color: logoutColor }}
          />
        </Menu>
      </Appbar.Header>
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={handleIndexChange}
        renderScene={renderScene}
        shifting={false}
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

export default function TabLayout() {
  return (
    <GeneratorProvider>
      <TabLayoutContent />
    </GeneratorProvider>
  );
}
