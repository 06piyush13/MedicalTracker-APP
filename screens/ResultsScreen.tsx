import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRoute, type RouteProp, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/App";
import type { HistoryStackParamList } from "@/navigation/HistoryStackNavigator";
import { Feather } from "@expo/vector-icons";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useTheme } from "@/hooks/useTheme";
import { getHealthCheckById, type HealthCheck } from "@/utils/storage";
import { Spacing, Typography, BorderRadius } from "@/constants/theme";

type ResultsScreenRouteProp = RouteProp<
  RootStackParamList & HistoryStackParamList,
  "Results"
>;

export default function ResultsScreen() {
  const { theme } = useTheme();
  const route = useRoute<ResultsScreenRouteProp>();
  const navigation = useNavigation();
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null);

  useEffect(() => {
    loadHealthCheck();
  }, [route.params]);

  const loadHealthCheck = async () => {
    if ("checkId" in route.params) {
      const check = await getHealthCheckById(route.params.checkId);
      setHealthCheck(check);
    } else if ("symptoms" in route.params) {
      const checks = await import("@/utils/storage").then((m) =>
        m.getHealthChecks()
      );
      if (checks.length > 0) {
        setHealthCheck(checks[0]);
      }
    }
  };

  const handleFindDoctors = () => {
    navigation.navigate("Main" as any, {
      screen: "DoctorsTab",
    } as any);
  };

  if (!healthCheck) {
    return (
      <View style={styles.loadingContainer}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <Card style={[styles.predictionCard, { borderColor: theme.info }]}>
          <View style={styles.iconContainer}>
            <Feather name="activity" size={32} color={theme.info} />
          </View>
          <ThemedText style={[Typography.h3, styles.predictionTitle]}>
            Analysis Result
          </ThemedText>
          <ThemedText
            style={[
              Typography.h2,
              styles.predictionText,
              { color: theme.info },
            ]}
          >
            {healthCheck.prediction}
          </ThemedText>
        </Card>

        <View style={styles.section}>
          <ThemedText style={[Typography.h3, styles.sectionTitle]}>
            Your Symptoms
          </ThemedText>
          <Card>
            <View style={styles.symptomsGrid}>
              {healthCheck.symptoms.map((symptom, index) => (
                <View key={index} style={styles.symptomRow}>
                  <Feather
                    name="check-circle"
                    size={16}
                    color={theme.primary}
                  />
                  <ThemedText style={[Typography.body, styles.symptomText]}>
                    {symptom}
                  </ThemedText>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {healthCheck.medications.length > 0 ? (
          <View style={styles.section}>
            <ThemedText style={[Typography.h3, styles.sectionTitle]}>
              Recommended Care
            </ThemedText>
            <Card>
              {healthCheck.medications.map((medication, index) => (
                <View key={index} style={styles.listItem}>
                  <Feather
                    name="heart"
                    size={16}
                    color={theme.success}
                  />
                  <ThemedText style={[Typography.body, styles.listText]}>
                    {medication}
                  </ThemedText>
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        {healthCheck.nextSteps.length > 0 ? (
          <View style={styles.section}>
            <ThemedText style={[Typography.h3, styles.sectionTitle]}>
              Next Steps
            </ThemedText>
            <Card>
              {healthCheck.nextSteps.map((step, index) => (
                <View key={index} style={styles.listItem}>
                  <Feather
                    name="arrow-right-circle"
                    size={16}
                    color={theme.warning}
                  />
                  <ThemedText style={[Typography.body, styles.listText]}>
                    {step}
                  </ThemedText>
                </View>
              ))}
            </Card>
          </View>
        ) : null}

        <Card style={[styles.disclaimerCard, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="info" size={20} color={theme.textSecondary} />
          <ThemedText
            style={[
              Typography.small,
              styles.disclaimer,
              { color: theme.textSecondary },
            ]}
          >
            This analysis is for informational purposes only and is not a
            substitute for professional medical advice, diagnosis, or
            treatment. Always seek the advice of your physician or other
            qualified health provider.
          </ThemedText>
        </Card>

        <PrimaryButton
          title="Find Nearby Doctors"
          onPress={handleFindDoctors}
        />
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  predictionCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    borderWidth: 2,
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.md,
  },
  predictionTitle: {
    marginBottom: Spacing.xs,
  },
  predictionText: {
    textAlign: "center",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  symptomsGrid: {
    gap: Spacing.sm,
  },
  symptomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  symptomText: {
    flex: 1,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  listText: {
    flex: 1,
  },
  disclaimerCard: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  disclaimer: {
    flex: 1,
    lineHeight: 18,
  },
});
