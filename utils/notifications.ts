import { MedicationReminder } from "./storage";

export async function requestNotificationPermissions(): Promise<boolean> {
  return true;
}

export function configureNotificationHandler(): void {
  console.log("Notification handler configured");
}

export async function scheduleMedicationReminder(
  reminder: MedicationReminder
): Promise<void> {
  if (reminder.enabled) {
    console.log(
      `Medication reminder scheduled: ${reminder.medicationName} at ${reminder.time}`
    );
  }
}

export async function cancelMedicationReminder(reminderId: string): Promise<void> {
  console.log(`Medication reminder cancelled: ${reminderId}`);
}

export async function getMedicationReminders(): Promise<MedicationReminder[]> {
  return [];
}
