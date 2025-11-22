import React, { useState, useCallback } from "react";
import { View, StyleSheet, Alert, TextInput, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { useThemeContext } from "@/contexts/ThemeContext";
import { useEffect } from "react";
import {
  getUserProfile,
  saveUserProfile,
  getHealthChecks,
  type UserProfile,
} from "@/utils/storage";
import { generateHealthReportText } from "@/utils/pdf";
import { Spacing, Typography, BorderRadius } from "@/constants/theme";
import type { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { userName, logout } = useAuth();
  const { colorScheme, toggleTheme } = useThemeContext();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingAllergy, setEditingAllergy] = useState("");
  const [editingHistory, setEditingHistory] = useState("");

  const handleToggleTheme = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    const userProfile = await getUserProfile(userName);
    setProfile(userProfile);
  };

  const addAllergy = async () => {
    if (editingAllergy.trim() && profile) {
      const updatedProfile = {
        ...profile,
        allergies: [...profile.allergies, editingAllergy.trim()],
        lastUpdated: new Date().toISOString(),
      };
      await saveUserProfile(updatedProfile);
      setProfile(updatedProfile);
      setEditingAllergy("");
    }
  };

  const removeAllergy = async (index: number) => {
    if (profile) {
      const updatedProfile = {
        ...profile,
        allergies: profile.allergies.filter((_, i) => i !== index),
        lastUpdated: new Date().toISOString(),
      };
      await saveUserProfile(updatedProfile);
      setProfile(updatedProfile);
    }
  };

  const addMedicalHistory = async () => {
    if (editingHistory.trim() && profile) {
      const updatedProfile = {
        ...profile,
        medicalHistory: [...profile.medicalHistory, editingHistory.trim()],
        lastUpdated: new Date().toISOString(),
      };
      await saveUserProfile(updatedProfile);
      setProfile(updatedProfile);
      setEditingHistory("");
    }
  };

  const removeMedicalHistory = async (index: number) => {
    if (profile) {
      const updatedProfile = {
        ...profile,
        medicalHistory: profile.medicalHistory.filter((_, i) => i !== index),
        lastUpdated: new Date().toISOString(),
      };
      await saveUserProfile(updatedProfile);
      setProfile(updatedProfile);
    }
  };

  const exportHealthReport = async () => {
    if (!profile) return;
    try {
      const checks = await getHealthChecks();
      const report = {
        userProfile: profile,
        healthChecks: checks,
        generatedDate: new Date().toISOString(),
      };
      const text = generateHealthReportText(report);
      Alert.alert("Success", "Health report generated:\n\n" + text.substring(0, 200) + "...");
    } catch (error) {
      Alert.alert("Error", "Failed to generate health report");
    }
  };

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

  if (!profile) {
    return null;
  }

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
            Medical Information
          </ThemedText>

          <Card style={styles.medicalCard}>
            <ThemedText style={[Typography.body, styles.fieldLabel]}>
              Allergies
            </ThemedText>
            {profile.allergies.map((allergy, index) => (
              <View key={index} style={styles.tagContainer}>
                <View style={[styles.tag, { backgroundColor: theme.primary }]}>
                  <ThemedText style={[Typography.small, { color: theme.buttonText }]}>
                    {allergy}
                  </ThemedText>
                </View>
                <Pressable onPress={() => removeAllergy(index)}>
                  <Feather name="x" size={16} color={theme.textSecondary} />
                </Pressable>
              </View>
            ))}
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.border },
                ]}
                placeholder="Add allergy..."
                placeholderTextColor={theme.textSecondary}
                value={editingAllergy}
                onChangeText={setEditingAllergy}
              />
              <Pressable
                style={[styles.addButton, { backgroundColor: theme.primary }]}
                onPress={addAllergy}
              >
                <Feather name="plus" size={18} color={theme.buttonText} />
              </Pressable>
            </View>
          </Card>

          <Card style={styles.medicalCard}>
            <ThemedText style={[Typography.body, styles.fieldLabel]}>
              Medical History
            </ThemedText>
            {profile.medicalHistory.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <ThemedText style={[Typography.small, styles.historyText]}>
                  {item}
                </ThemedText>
                <Pressable onPress={() => removeMedicalHistory(index)}>
                  <Feather name="trash-2" size={16} color={theme.error} />
                </Pressable>
              </View>
            ))}
            <View style={styles.inputRow}>
              <TextInput
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.border },
                ]}
                placeholder="Add medical history..."
                placeholderTextColor={theme.textSecondary}
                value={editingHistory}
                onChangeText={setEditingHistory}
              />
              <Pressable
                style={[styles.addButton, { backgroundColor: theme.primary }]}
                onPress={addMedicalHistory}
              >
                <Feather name="plus" size={18} color={theme.buttonText} />
              </Pressable>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText style={[Typography.h3, styles.sectionTitle]}>
            Actions
          </ThemedText>

          <PrimaryButton
            title="Manage Medications"
            onPress={() => navigation.navigate("Medications")}
          />

          <PrimaryButton
            title="Export Health Report"
            onPress={exportHealthReport}
            style={styles.buttonMargin}
          />
        </View>

        <View style={styles.section}>
          <ThemedText style={[Typography.h3, styles.sectionTitle]}>
            Settings
          </ThemedText>

          <Pressable onPress={handleToggleTheme}>
            <Card style={styles.settingCard}>
              <View style={styles.settingRow}>
                <Feather
                  name={colorScheme === "dark" ? "package" : "heart"}
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
          </Pressable>

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
  medicalCard: {
    marginBottom: Spacing.md,
    paddingVertical: Spacing.md,
  },
  fieldLabel: {
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    justifyContent: "space-between",
  },
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    flex: 1,
    marginRight: Spacing.sm,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
  },
  addButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  historyText: {
    flex: 1,
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
  buttonMargin: {
    marginTop: Spacing.md,
  },
});
