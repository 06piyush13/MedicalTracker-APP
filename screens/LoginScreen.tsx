import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";

export default function LoginScreen() {
  const { theme } = useTheme();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter your name to continue");
      return;
    }

    setLoading(true);
    try {
      await login(name.trim());
    } catch (error) {
      Alert.alert("Error", "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenKeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText style={[Typography.h1, styles.title]}>
            Medical Tracker
          </ThemedText>
          <ThemedText
            style={[
              Typography.body,
              styles.subtitle,
              { color: theme.textSecondary },
            ]}
          >
            Track your health, understand your symptoms
          </ThemedText>
        </View>

        <View style={styles.form}>
          <ThemedText style={[Typography.body, styles.label]}>
            Welcome! What's your name?
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
            placeholder="Enter your name"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          <PrimaryButton
            title="Get Started"
            onPress={handleLogin}
            disabled={!name.trim()}
            loading={loading}
          />

          <ThemedText
            style={[
              Typography.caption,
              styles.disclaimer,
              { color: theme.textSecondary },
            ]}
          >
            By continuing, you agree that this app provides general health
            information only and is not a substitute for professional medical
            advice.
          </ThemedText>
        </View>
      </ThemedView>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["4xl"],
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  label: {
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    fontSize: 16,
  },
  disclaimer: {
    marginTop: Spacing.xl,
    textAlign: "center",
    lineHeight: 18,
  },
});
