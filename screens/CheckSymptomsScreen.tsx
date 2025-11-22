import React, { useState } from "react";
import { View, StyleSheet, TextInput, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { PrimaryButton } from "@/components/PrimaryButton";
import { SymptomChip } from "@/components/SymptomChip";
import { useTheme } from "@/hooks/useTheme";
import { COMMON_SYMPTOMS, generateMockPrediction } from "@/utils/symptoms";
import { saveHealthCheck } from "@/utils/storage";
import { Spacing, Typography, BorderRadius } from "@/constants/theme";
import type { RootStackParamList } from "@/App";

export default function CheckSymptomsScreen() {
  const { theme } = useTheme();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert("No symptoms", "Please select at least one symptom");
      return;
    }

    setLoading(true);
    try {
      const { prediction, medications, nextSteps } =
        generateMockPrediction(selectedSymptoms);

      const healthCheck = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        symptoms: selectedSymptoms,
        prediction,
        medications,
        nextSteps,
      };

      await saveHealthCheck(healthCheck);

      navigation.navigate("Results", { symptoms: selectedSymptoms });
    } catch (error) {
      Alert.alert("Error", "Failed to analyze symptoms");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedSymptoms([]);
    setSearchText("");
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <View style={styles.container}>
        <ThemedText style={[Typography.h3, styles.title]}>
          Enter your symptoms
        </ThemedText>
        <ThemedText
          style={[
            Typography.body,
            styles.subtitle,
            { color: theme.textSecondary },
          ]}
        >
          Select from common symptoms or search for specific ones
        </ThemedText>

        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
              color: theme.text,
            },
          ]}
          placeholder="Search or filter symptoms"
          placeholderTextColor={theme.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />

        <View style={styles.chipsContainer}>
          {COMMON_SYMPTOMS.filter((symptom) =>
            symptom.toLowerCase().includes(searchText.toLowerCase())
          ).map((symptom) => (
            <SymptomChip
              key={symptom}
              label={symptom}
              selected={selectedSymptoms.includes(symptom)}
              onPress={() => toggleSymptom(symptom)}
            />
          ))}
        </View>

        {selectedSymptoms.length > 0 ? (
          <View style={styles.selectedSection}>
            <ThemedText style={[Typography.body, styles.selectedTitle]}>
              Selected Symptoms ({selectedSymptoms.length})
            </ThemedText>
            <View style={styles.selectedList}>
              {selectedSymptoms.map((symptom) => (
                <View
                  key={symptom}
                  style={[
                    styles.selectedItem,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <ThemedText
                    style={[
                      Typography.body,
                      { color: theme.buttonText },
                    ]}
                  >
                    {symptom}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.buttons}>
          <PrimaryButton
            title="Analyze Symptoms"
            onPress={handleAnalyze}
            disabled={selectedSymptoms.length === 0}
            loading={loading}
          />
          {selectedSymptoms.length > 0 ? (
            <PrimaryButton
              title="Reset"
              onPress={handleReset}
              variant="secondary"
            />
          ) : null}
        </View>
      </View>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  searchInput: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    fontSize: 16,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.xl,
  },
  selectedSection: {
    marginBottom: Spacing.xl,
  },
  selectedTitle: {
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  selectedList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  selectedItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  buttons: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
});
