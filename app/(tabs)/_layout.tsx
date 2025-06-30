import React from 'react';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { GeneratorProvider } from '@/contexts/GeneratorContext';

export default function TabLayout() {
  const paperTheme = useTheme();
  const colorScheme = useColorScheme() ?? 'dark';

  return (
    <GeneratorProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme].tint,
          tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
          tabBarStyle: {
              backgroundColor: paperTheme.colors.elevation.level2,
          },
          headerStyle: {
              backgroundColor: paperTheme.colors.elevation.level2,
          },
          headerTitleStyle: {
              color: Colors[colorScheme].text,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="vault"
          options={{
            title: 'Your Vault',
            tabBarIcon: ({ color }) => <Feather name="shield" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="generator"
          options={{
            title: 'Password Generator',
            tabBarIcon: ({ color }) => <Feather name="key" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="alerts"
          options={{
            title: 'Security Alerts',
            tabBarIcon: ({ color }) => <Feather name="alert-triangle" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Feather name="settings" size={24} color={color} />,
          }}
        />
      </Tabs>
    </GeneratorProvider>
  );
}
