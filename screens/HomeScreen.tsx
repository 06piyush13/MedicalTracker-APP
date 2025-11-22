import React, { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { getHealthChecks, type HealthCheck } from "@/utils/storage";
import { Spacing, Typography, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/App";

export default function HomeScreen() {
  const { theme } = useTheme();
  const { userName } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [recentChecks, setRecentChecks] = useState<HealthCheck[]>([]);
  const [totalChecks, setTotalChecks] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadHealthData();
    }, [])
  );

  const loadHealthData = async () => {
    const checks = await getHealthChecks();
    setTotalChecks(checks.length);
    setRecentChecks(checks.slice(0, 3));
  };

  const handleStartCheck = () => {
    navigation.navigate("CheckSymptoms");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <View style={styles.greeting}>
          <ThemedText style={[Typography.h2, styles.greetingText]}>
            Hello, {userName}
          </ThemedText>
          <ThemedText
            style={[
              Typography.body,
              { color: theme.textSecondary },
            ]}
          >
            How are you feeling today?
          </ThemedText>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <ThemedText
              style={[Typography.h1, { color: theme.primary }]}
            >
              {totalChecks}
            </ThemedText>
            <ThemedText
              style={[
                Typography.small,
                { color: theme.textSecondary },
              ]}
            >
              Total Checks
            </ThemedText>
          </Card>
          <Card style={styles.statCard}>
            <ThemedText
              style={[Typography.h1, { color: theme.primary }]}
            >
              {recentChecks.length > 0
                ? formatDate(recentChecks[0].date)
                : "-"}
            </ThemedText>
            <ThemedText
              style={[
                Typography.small,
                { color: theme.textSecondary },
              ]}
            >
              Last Check
            </ThemedText>
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText style={[Typography.h3, styles.sectionTitle]}>
            Quick Action
          </ThemedText>
          <PrimaryButton
            title="Check Your Symptoms"
            onPress={handleStartCheck}
          />
        </View>

        {recentChecks.length > 0 ? (
          <View style={styles.section}>
            <ThemedText style={[Typography.h3, styles.sectionTitle]}>
              Recent Checks
            </ThemedText>
            {recentChecks.map((check) => (
              <Card key={check.id} style={styles.checkCard}>
                <View style={styles.checkHeader}>
                  <ThemedText style={[Typography.body, styles.checkDate]}>
                    {new Date(check.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </ThemedText>
                </View>
                <View style={styles.symptomsContainer}>
                  {check.symptoms.slice(0, 3).map((symptom, index) => (
                    <View
                      key={index}
                      style={[
                        styles.symptomTag,
                        { backgroundColor: theme.backgroundSecondary },
                      ]}
                    >
                      <ThemedText
                        style={[
                          Typography.small,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {symptom}
                      </ThemedText>
                    </View>
                  ))}
                  {check.symptoms.length > 3 ? (
                    <ThemedText
                      style={[
                        Typography.small,
                        { color: theme.textSecondary },
                      ]}
                    >
                      +{check.symptoms.length - 3} more
                    </ThemedText>
                  ) : null}
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Feather
              name="clipboard"
              size={48}
              color={theme.textSecondary}
              style={styles.emptyIcon}
            />
            <ThemedText
              style={[
                Typography.body,
                styles.emptyText,
                { color: theme.textSecondary },
              ]}
            >
              No health checks yet
            </ThemedText>
            <ThemedText
              style={[
                Typography.small,
                { color: theme.textSecondary },
              ]}
            >
              Start by checking your symptoms
            </ThemedText>
          </Card>
        )}
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  greeting: {
    marginBottom: Spacing.xl,
  },
  greetingText: {
    marginBottom: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  checkCard: {
    marginBottom: Spacing.md,
  },
  checkHeader: {
    marginBottom: Spacing.sm,
  },
  checkDate: {
    fontWeight: "600",
  },
  symptomsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    alignItems: "center",
  },
  symptomTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyIcon: {
    marginBottom: Spacing.md,
  },
  emptyText: {
    marginBottom: Spacing.xs,
  },
});
