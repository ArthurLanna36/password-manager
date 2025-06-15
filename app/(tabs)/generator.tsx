import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useGeneratorContext } from "@/contexts/GeneratorContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Checkbox,
  Dialog,
  Button as PaperButton,
  Text as PaperText,
  Portal,
  TextInput,
} from "react-native-paper";
import { styles } from "./styles/generator.styles";

export default function GeneratorScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const [passwordLength, setPasswordLength] = useState(25);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSpecialChars, setIncludeSpecialChars] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [isErrorDialogVisible, setIsErrorDialogVisible] = useState(false);
  const [isCopyDialogVisible, setIsCopyDialogVisible] = useState(false);

  const { needsClear, setNeedsClear, setClearPasswordAction } =
    useGeneratorContext();

  const performClearPassword = () => {
    setGeneratedPassword("");
  };

  useEffect(() => {
    setClearPasswordAction(() => performClearPassword);
    return () => {
      setClearPasswordAction(undefined);
    };
  }, [setClearPasswordAction]);

  useEffect(() => {
    if (needsClear) {
      performClearPassword();
      setNeedsClear(false);
    }
  }, [needsClear, setNeedsClear]);

  useEffect(() => {
    performClearPassword();
  }, []);

  const handleGeneratePassword = () => {
    const charsetParts = [];
    if (includeUppercase) charsetParts.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    if (includeLowercase) charsetParts.push("abcdefghijklmnopqrstuvwxyz");
    if (includeNumbers) charsetParts.push("0123456789");
    if (includeSpecialChars) charsetParts.push("!@#$%^&*()_+-=[]{}|;:',.<>?");

    if (charsetParts.length === 0) {
      setIsErrorDialogVisible(true);
      setGeneratedPassword("");
      return;
    }

    let newPassword = "";
    const fullCharset = charsetParts.join("");

    for (let i = 0; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * fullCharset.length);
      newPassword += fullCharset[randomIndex];
    }
    setGeneratedPassword(newPassword);
  };

  const hideErrorDialog = () => setIsErrorDialogVisible(false);
  const hideCopyDialog = () => setIsCopyDialogVisible(false);

  const copyToClipboard = async (text: string) => {
    if (!text) return;
    await Clipboard.setStringAsync(text);
    setIsCopyDialogVisible(true);
  };

  const incrementLength = () =>
    setPasswordLength((prev) => Math.min(prev + 1, 128));
  const decrementLength = () =>
    setPasswordLength((prev) => Math.max(prev - 1, 4));

  const dynamicStyles = {
    container: {
      backgroundColor: Colors[colorScheme].background,
    },
    sectionTitle: {
      color: Colors[colorScheme].text,
    },
    lengthValueText: {
      color: Colors[colorScheme].text,
    },
    generatedPasswordInput: {
      flex: 1,
      marginRight: 10,
    },
    iconColor: Colors[colorScheme].tint,
    lengthButton: {
      borderColor: Colors[colorScheme].tint,
    },
    checkboxColor: Colors[colorScheme].tint,
    checkboxUncheckedColor: Colors[colorScheme].icon,
    checkboxLabelStyle: {
      color: Colors[colorScheme].text,
    },
    dialogTitle: {
      color: Colors[colorScheme].text,
    },
    dialogContentText: {
      color: Colors[colorScheme].text,
    },
    dialogButtonText: {
      color: Colors[colorScheme].tint,
    },
  };

  const characterOptions = [
    {
      key: "uppercase",
      label: "Uppercase Letters",
      value: includeUppercase,
      setter: setIncludeUppercase,
    },
    {
      key: "lowercase",
      label: "Lowercase Letters",
      value: includeLowercase,
      setter: setIncludeLowercase,
    },
    {
      key: "numbers",
      label: "Numbers",
      value: includeNumbers,
      setter: setIncludeNumbers,
    },
    {
      key: "special",
      label: "Special Characters",
      value: includeSpecialChars,
      setter: setIncludeSpecialChars,
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, dynamicStyles.container]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.card}>
          <ThemedText style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            Password Length
          </ThemedText>
          <View style={styles.lengthControlContainer}>
            <TouchableOpacity
              onPress={decrementLength}
              style={[styles.lengthButton, dynamicStyles.lengthButton]}
            >
              <Feather name="minus" size={24} color={dynamicStyles.iconColor} />
            </TouchableOpacity>
            <Text style={[styles.lengthValue, dynamicStyles.lengthValueText]}>
              {passwordLength}
            </Text>
            <TouchableOpacity
              onPress={incrementLength}
              style={[styles.lengthButton, dynamicStyles.lengthButton]}
            >
              <Feather name="plus" size={24} color={dynamicStyles.iconColor} />
            </TouchableOpacity>
          </View>

          <ThemedText
            style={[
              styles.sectionTitle,
              dynamicStyles.sectionTitle,
              { marginTop: 20 },
            ]}
          >
            Increase your password security
          </ThemedText>
          {characterOptions.map((option) => (
            <Checkbox.Item
              key={option.key}
              label={option.label}
              status={option.value ? "checked" : "unchecked"}
              onPress={() => option.setter(!option.value)}
              color={dynamicStyles.checkboxColor}
              uncheckedColor={dynamicStyles.checkboxUncheckedColor}
              labelStyle={dynamicStyles.checkboxLabelStyle}
              style={styles.checkboxItemContainer}
              position="trailing"
            />
          ))}

          {/* Button section updated */}
          <View style={styles.buttonContainer}>
            <PaperButton
              mode="contained"
              icon="arrow-right"
              onPress={handleGeneratePassword}
            >
              Generate Password
            </PaperButton>
          </View>
        </ThemedView>

        {generatedPassword ? (
          <ThemedView style={styles.card}>
            <ThemedText
              style={[styles.sectionTitle, dynamicStyles.sectionTitle]}
            >
              Generated Password
            </ThemedText>
            <View style={styles.generatedPasswordContainer}>
              <TextInput
                mode="outlined"
                style={dynamicStyles.generatedPasswordInput}
                value={generatedPassword}
                editable={false}
                right={
                  <TextInput.Icon
                    icon="content-copy"
                    onPress={() => copyToClipboard(generatedPassword)}
                  />
                }
              />
            </View>
          </ThemedView>
        ) : null}
      </ScrollView>

      <Portal>
        <Dialog visible={isErrorDialogVisible} onDismiss={hideErrorDialog}>
          <Dialog.Title style={dynamicStyles.dialogTitle}>Error</Dialog.Title>
          <Dialog.Content>
            <PaperText style={dynamicStyles.dialogContentText}>
              Please select at least one character type to generate the
              password.
            </PaperText>
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton
              onPress={hideErrorDialog}
              textColor={dynamicStyles.dialogButtonText.color}
            >
              OK
            </PaperButton>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={isCopyDialogVisible} onDismiss={hideCopyDialog}>
          <Dialog.Title style={dynamicStyles.dialogTitle}>Copied!</Dialog.Title>
          <Dialog.Content>
            <PaperText style={dynamicStyles.dialogContentText}>
              Password copied to clipboard.
            </PaperText>
          </Dialog.Content>
          <Dialog.Actions>
            <PaperButton
              onPress={hideCopyDialog}
              textColor={dynamicStyles.dialogButtonText.color}
            >
              OK
            </PaperButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}
