import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  Text,
} from "react-native";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";

export default function LoginScreen() {
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
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Medical Tracker</Text>
          <Text style={styles.subtitle}>Track your health, understand your symptoms</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Welcome! What's your name?</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#999"
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

          <Text style={styles.disclaimer}>
            By continuing, you agree that this app provides general health
            information only and is not a substitute for professional medical
            advice.
          </Text>
        </View>
      </View>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: "center",
    backgroundColor: "#ffffff",
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
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: Spacing.sm,
    textAlign: "center",
    color: "#000",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
  },
  form: {
    width: "100%",
  },
  label: {
    marginBottom: Spacing.md,
    fontWeight: "600",
    fontSize: 16,
    color: "#000",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#000",
  },
  disclaimer: {
    marginTop: Spacing.xl,
    textAlign: "center",
    lineHeight: 18,
    fontSize: 12,
    color: "#666",
  },
});
