import React, { useState, useCallback } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HistoryStackParamList } from "@/navigation/HistoryStackNavigator";
import { Feather } from "@expo/vector-icons";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { getHealthChecks, type HealthCheck } from "@/utils/storage";
import { Spacing, Typography, BorderRadius } from "@/constants/theme";

export default function HistoryScreen() {
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<HistoryStackParamList>>();
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    const checks = await getHealthChecks();
    setHealthChecks(checks);
  };

  const handleCheckPress = (checkId: string) => {
    navigation.navigate("Results", { checkId });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        {healthChecks.length > 0 ? (
          healthChecks.map((check) => (
            <Pressable key={check.id} onPress={() => handleCheckPress(check.id)}>
              <Card style={styles.checkCard}>
                <View style={styles.checkHeader}>
                  <View>
                    <ThemedText style={[Typography.body, styles.checkDate]}>
                      {formatDate(check.date)}
                    </ThemedText>
                    <ThemedText
                      style={[
                        Typography.small,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {formatTime(check.date)}
                    </ThemedText>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={20}
                    color={theme.textSecondary}
                  />
                </View>
                <View style={styles.symptomsContainer}>
                  {check.symptoms.slice(0, 4).map((symptom, index) => (
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
                  {check.symptoms.length > 4 ? (
                    <ThemedText
                      style={[
                        Typography.small,
                        { color: theme.textSecondary },
                      ]}
                    >
                      +{check.symptoms.length - 4}
                    </ThemedText>
                  ) : null}
                </View>
                {check.prediction ? (
                  <View style={styles.predictionContainer}>
                    <ThemedText
                      style={[
                        Typography.small,
                        {
                          color: theme.primary,
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {check.prediction}
                    </ThemedText>
                  </View>
                ) : null}
              </Card>
            </Pressable>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Feather
              name="clock"
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
              No health history yet
            </ThemedText>
            <ThemedText
              style={[
                Typography.small,
                { color: theme.textSecondary },
              ]}
            >
              Your past health checks will appear here
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
  checkCard: {
    marginBottom: Spacing.md,
  },
  checkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  checkDate: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  symptomsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  symptomTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  predictionContainer: {
    marginTop: Spacing.xs,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  emptyIcon: {
    marginBottom: Spacing.md,
  },
  emptyText: {
    marginBottom: Spacing.xs,
  },
});
