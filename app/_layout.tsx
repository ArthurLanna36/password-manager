import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuthSession } from "@/hooks/useAuthSession"; 

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { session, loading } = useAuthSession();
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';

  useEffect(() => {
    if (loading || (!fontsLoaded && !fontError)) {
      return;
    }

    const inAuthGroup = segments[0] === '(tabs)';

    if (!session && inAuthGroup) {
      router.replace('/login-page');
    } 
    
    else if (session && !inAuthGroup) {
      router.replace('/');
    }

    SplashScreen.hideAsync();

  }, [session, loading, fontsLoaded, fontError, segments, router]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const paperThemeToUse = colorScheme === "dark" ? MD3DarkTheme : MD3LightTheme;
  const navigationThemeToUse = colorScheme === "dark" ? NavigationDarkTheme : NavigationDefaultTheme;

  return (
    <PaperProvider theme={paperThemeToUse}>
      <ThemeProvider value={navigationThemeToUse}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login-page" options={{ headerShown: false }} />
          <Stack.Screen name="register-page" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}