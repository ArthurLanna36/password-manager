import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuthSession } from "@/hooks/useAuthSession";


SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, loading } = useAuthSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; 
    }

    
    const inTabsGroup = segments[0] === '(tabs)';

    
    if (!session && inTabsGroup) {
      router.replace('/login-page');
    } else if (session && !inTabsGroup) {
      router.replace('/');
    }

    
    SplashScreen.hideAsync();
    
  }, [session, loading, segments, router]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login-page" options={{ headerShown: false }} />
      <Stack.Screen name="register-page" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const colorScheme = useColorScheme() ?? 'dark';
  const paperThemeToUse = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;
  const navigationThemeToUse = colorScheme === "dark" ? NavigationDarkTheme : NavigationDefaultTheme;

  useEffect(() => {
    
    if (fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontError]);

  
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperThemeToUse}>
        <ThemeProvider value={navigationThemeToUse}>
          <RootLayoutNav />
        </ThemeProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
