import React from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Spacing, Typography } from "@/constants/theme";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { userName, logout } = useAuth();
  const colorScheme = useColorScheme();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          onPress: async () => {
            await logout();
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <Card style={styles.profileCard}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.primary },
            ]}
          >
            <ThemedText
              style={[
                Typography.h1,
                { color: theme.buttonText },
              ]}
            >
              {userName.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <ThemedText style={[Typography.h2, styles.userName]}>
            {userName}
          </ThemedText>
          <ThemedText
            style={[
              Typography.small,
              { color: theme.textSecondary },
            ]}
          >
            Medical Tracker User
          </ThemedText>
        </Card>

        <View style={styles.section}>
          <ThemedText style={[Typography.h3, styles.sectionTitle]}>
            Settings
          </ThemedText>

          <Card style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Feather
                name="moon"
                size={20}
                color={theme.textSecondary}
              />
              <View style={styles.settingInfo}>
                <ThemedText style={[Typography.body, styles.settingLabel]}>
                  Theme
                </ThemedText>
                <ThemedText
                  style={[
                    Typography.small,
                    { color: theme.textSecondary },
                  ]}
                >
                  {colorScheme === "dark" ? "Dark" : "Light"}
                </ThemedText>
              </View>
            </View>
          </Card>

          <Card style={styles.settingCard}>
            <View style={styles.settingRow}>
              <Feather
                name="shield"
                size={20}
                color={theme.textSecondary}
              />
              <View style={styles.settingInfo}>
                <ThemedText style={[Typography.body, styles.settingLabel]}>
                  Privacy & Security
                </ThemedText>
                <ThemedText
                  style={[
                    Typography.small,
                    { color: theme.textSecondary },
                  ]}
                >
                  Your data is stored locally
                </ThemedText>
              </View>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText style={[Typography.h3, styles.sectionTitle]}>
            About
          </ThemedText>

          <Card>
            <ThemedText
              style={[
                Typography.body,
                styles.aboutText,
                { color: theme.textSecondary },
              ]}
            >
              Medical Tracker helps you monitor your health by tracking
              symptoms and providing general health information. This app is not
              a substitute for professional medical advice.
            </ThemedText>
          </Card>
        </View>

        <PrimaryButton
          title="Logout"
          onPress={handleLogout}
          variant="destructive"
        />

        <ThemedText
          style={[
            Typography.caption,
            styles.version,
            { color: theme.textSecondary },
          ]}
        >
          Version 1.0.0
        </ThemedText>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  settingCard: {
    marginBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  aboutText: {
    lineHeight: 22,
  },
  version: {
    textAlign: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
});
