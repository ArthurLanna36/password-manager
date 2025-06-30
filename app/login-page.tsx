import { Colors } from "@/constants/Colors";
import { supabase } from "@/constants/supabase";
import { useColorScheme } from "@/hooks/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Checkbox, TextInput } from "react-native-paper";
import { logAuditEvent } from "@/utils/auditLogService"; 
import { registerForPushNotificationsAsync, savePushToken } from "@/utils/notificationService"; 

const KEEP_ME_SIGNED_IN_KEY = "keepMeSignedInPreference";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#000" },
  flex: { flex: 1 },
  container: {
    flex: 1,
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "transparent",
  },
  button: {
    backgroundColor: "#0047AB",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  linkWrapper: { marginTop: 16, alignItems: "center" },
  link: { color: "#0047AB", fontSize: 14 },
  checkboxContainer: {
    marginBottom: 10,
  },
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";

  useEffect(() => {
    const loadPreference = async () => {
      try {
        const value = await AsyncStorage.getItem(KEEP_ME_SIGNED_IN_KEY);
        if (value !== null) {
          setKeepMeSignedIn(JSON.parse(value));
        }
      } catch (e) {
        console.error("Failed to load keepMeSignedIn preference.", e);
      }
    };
    loadPreference();
  }, []);

  const handleSignIn = async () => {
    if (loading) return;
    if (loading) return;
    setLoading(true);

    try {
      // Login process initializer
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        throw new Error(error?.message || "User not found.");
      }

      const { user } = data;
      // User id get

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({ id: user.id, username: user.email?.split('@')[0] || 'New User' }, { onConflict: 'id' });

      if (profileError) {
        throw new Error(`Could not initialize profile: ${profileError.message}`);
      }
      // User garanted login

      try {
          await logAuditEvent('LOGIN_SUCCESS', user);
          // audit log send

          const token = await registerForPushNotificationsAsync();
          if (token) {
              // Trying to save token 
              await savePushToken(user.id, token);
          } else {
              // Token error
          }
      } catch(secondaryError) {
          // Secondary error
      }

      router.replace('/');

    } catch (err: any) {
      Alert.alert("Login failed", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Welcome Back</Text>
          <TextInput
            label="Email"
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            label="Password"
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Checkbox.Item
            label="Keep me signed in"
            status={keepMeSignedIn ? "checked" : "unchecked"}
            onPress={() => setKeepMeSignedIn(!keepMeSignedIn)}
            color={Colors[colorScheme].tint}
            uncheckedColor={Colors[colorScheme].icon}
            labelStyle={{ color: Colors[colorScheme].text, fontSize: 16 }}
            style={styles.checkboxContainer}
            position="trailing"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>
          <View style={styles.linkWrapper}>
            <TouchableOpacity onPress={() => router.push("/register-page")}>
              <Text style={styles.link}>Don’t have an account? Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
