// app/(tabs)/register-page.tsx
import { supabase } from "@/constants/supabase";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
// 1. Import TextInput from react-native-paper
import { TextInput } from "react-native-paper";

type Styles = {
  safe: ViewStyle;
  flex: ViewStyle;
  container: ViewStyle;
  title: TextStyle;
  input: TextStyle; // Kept for marginBottom
  button: ViewStyle;
  buttonDisabled: ViewStyle;
  buttonText: TextStyle;
  linkWrapper: ViewStyle;
  link: TextStyle;
};

// 5. Simplified styles
const styles = StyleSheet.create<Styles>({
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
});

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    if (loading) return;
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert("Sign-up failed", error.message);
    } else {
      Alert.alert("Almost there!", "Check your email for a confirmation link.");
      router.replace("/login-page");
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Create Account</Text>
          {/* 2. Replace react-native TextInput with Paper's TextInput */}
          {/* 3. Change 'placeholder' prop to 'label' */}
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
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
          <View style={styles.linkWrapper}>
            <TouchableOpacity onPress={() => router.replace("/login-page")}>
              <Text style={styles.link}>Already have an account? Log in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
