// app/(tabs)/_layout.tsx
import { Feather } from "@expo/vector-icons";
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
// ✨ 1. Importe a nova tela
import SettingsScreen from "./settings";
import VaultScreen from "./vault";

import { Colors } from "@/constants/Colors";
import {
  GeneratorProvider,
  useGeneratorContext,
} from "@/contexts/GeneratorContext";
import { useColorScheme } from "@/hooks/useColorScheme";

// Inner component to access context within the provider's scope
function TabLayoutContent() {
  const colorScheme = useColorScheme() ?? "light";
  const paperTheme = useTheme();
  const [index, setIndex] = useState(0);

  const { setNeedsClear, clearPasswordAction } = useGeneratorContext();

  // ✨ 2. Defina as rotas, incluindo a nova aba "Settings"
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
    // ✨ Adicionada a nova rota de configurações
    {
      key: "settings",
      title: "Settings",
      tabBarLabel: "Settings",
      focusedIcon: ({ color, size }: { color: string; size: number }) => (
        <Feather name="settings" size={size} color={color} />
      ),
      unfocusedIcon: ({ color, size }: { color: string; size: number }) => (
        <Feather name="settings" size={size} color={color} />
      ),
    },
  ]);

  // ✨ 3. Mapeie a chave da rota para o componente da tela
  const renderScene = BottomNavigation.SceneMap({
    home: HomeScreen,
    vault: VaultScreen,
    generator: GeneratorScreen,
    settings: SettingsScreen, // Mapeamento da nova tela
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

  return (
    <View style={{ flex: 1 }}>
      {/* ✨ 4. O cabeçalho agora está simplificado, sem o menu */}
      <Appbar.Header
        style={{ backgroundColor: paperTheme.colors.elevation.level2 }}
      >
        <Appbar.Content
          title={currentRouteTitle}
          titleStyle={{ color: Colors[colorScheme].text }}
        />
        {/* 🗑️ O Appbar.Action e o Menu foram removidos daqui */}
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
