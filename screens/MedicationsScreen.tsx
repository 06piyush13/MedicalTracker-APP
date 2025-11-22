import React, { useState, useCallback } from "react";
import { View, StyleSheet, Alert, TextInput, Pressable, Switch } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useTheme } from "@/hooks/useTheme";
import {
  getMedicationReminders,
  saveMedicationReminder,
  deleteMedicationReminder,
  type MedicationReminder,
} from "@/utils/storage";
import { Spacing, Typography, BorderRadius } from "@/constants/theme";

export default function MedicationsScreen() {
  const { theme } = useTheme();
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<MedicationReminder>>({
    medicationName: "",
    dosage: "",
    frequency: "daily",
    time: "09:00",
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
    notes: "",
  });

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [])
  );

  const loadReminders = async () => {
    const loadedReminders = await getMedicationReminders();
    setReminders(loadedReminders);
  };

  const addReminder = async () => {
    if (!formData.medicationName?.trim() || !formData.dosage?.trim()) {
      Alert.alert("Required", "Please fill in medication name and dosage");
      return;
    }

    const newReminder: MedicationReminder = {
      id: Date.now().toString(),
      medicationName: formData.medicationName || "",
      dosage: formData.dosage || "",
      frequency: formData.frequency || "daily",
      time: formData.time || "09:00",
      daysOfWeek: formData.daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
      enabled: formData.enabled ?? true,
      notes: formData.notes,
    };

    await saveMedicationReminder(newReminder);
    setReminders([...reminders, newReminder]);
    setFormData({
      medicationName: "",
      dosage: "",
      frequency: "daily",
      time: "09:00",
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      enabled: true,
      notes: "",
    });
    setShowForm(false);
    Alert.alert("Success", "Medication reminder added");
  };

  const deleteReminder = async (id: string) => {
    Alert.alert("Delete", "Remove this medication reminder?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          await deleteMedicationReminder(id);
          setReminders(reminders.filter((r) => r.id !== id));
        },
        style: "destructive",
      },
    ]);
  };

  const toggleReminder = async (reminder: MedicationReminder) => {
    const updated = { ...reminder, enabled: !reminder.enabled };
    await saveMedicationReminder(updated);
    setReminders(reminders.map((r) => (r.id === reminder.id ? updated : r)));
  };

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={[Typography.h2, styles.title]}>
            Medications
          </ThemedText>
          <PrimaryButton
            title={showForm ? "Cancel" : "Add Reminder"}
            onPress={() => setShowForm(!showForm)}
          />
        </View>

        {showForm && (
          <Card style={styles.formCard}>
            <ThemedText style={[Typography.body, styles.formLabel]}>
              Medication Name
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border },
              ]}
              placeholder="e.g., Aspirin"
              placeholderTextColor={theme.textSecondary}
              value={formData.medicationName}
              onChangeText={(text) =>
                setFormData({ ...formData, medicationName: text })
              }
            />

            <ThemedText style={[Typography.body, styles.formLabel]}>
              Dosage
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border },
              ]}
              placeholder="e.g., 500mg"
              placeholderTextColor={theme.textSecondary}
              value={formData.dosage}
              onChangeText={(text) =>
                setFormData({ ...formData, dosage: text })
              }
            />

            <ThemedText style={[Typography.body, styles.formLabel]}>
              Frequency
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border },
              ]}
              placeholder="e.g., daily, twice daily"
              placeholderTextColor={theme.textSecondary}
              value={formData.frequency}
              onChangeText={(text) =>
                setFormData({ ...formData, frequency: text })
              }
            />

            <ThemedText style={[Typography.body, styles.formLabel]}>
              Time
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border },
              ]}
              placeholder="HH:MM"
              placeholderTextColor={theme.textSecondary}
              value={formData.time}
              onChangeText={(text) =>
                setFormData({ ...formData, time: text })
              }
            />

            <ThemedText style={[Typography.body, styles.formLabel]}>
              Notes (optional)
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, borderColor: theme.border },
              ]}
              placeholder="e.g., Take with food"
              placeholderTextColor={theme.textSecondary}
              value={formData.notes}
              onChangeText={(text) =>
                setFormData({ ...formData, notes: text })
              }
            />

            <PrimaryButton title="Save Reminder" onPress={addReminder} />
          </Card>
        )}

        {reminders.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Feather
              name="package"
              size={40}
              color={theme.textSecondary}
              style={styles.emptyIcon}
            />
            <ThemedText
              style={[
                Typography.body,
                { color: theme.textSecondary, textAlign: "center" },
              ]}
            >
              No medication reminders yet. Add one to get started.
            </ThemedText>
          </Card>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderHeader}>
                <View style={styles.reminderInfo}>
                  <ThemedText
                    style={[Typography.body, { fontWeight: "600" }]}
                  >
                    {reminder.medicationName}
                  </ThemedText>
                  <ThemedText
                    style={[
                      Typography.small,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {reminder.dosage} • {reminder.time}
                  </ThemedText>
                  {reminder.notes && (
                    <ThemedText
                      style={[
                        Typography.small,
                        { color: theme.textSecondary, marginTop: Spacing.xs },
                      ]}
                    >
                      {reminder.notes}
                    </ThemedText>
                  )}
                </View>
                <View style={styles.reminderActions}>
                  <Switch
                    value={reminder.enabled}
                    onValueChange={() => toggleReminder(reminder)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                  />
                  <Pressable
                    onPress={() => deleteReminder(reminder.id)}
                    style={styles.deleteButton}
                  >
                    <Feather name="trash-2" size={18} color={theme.error} />
                  </Pressable>
                </View>
              </View>
            </Card>
          ))
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
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.md,
  },
  formCard: {
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  formLabel: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyIcon: {
    marginBottom: Spacing.md,
  },
  reminderCard: {
    marginBottom: Spacing.md,
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reminderInfo: {
    flex: 1,
  },
  reminderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
});
