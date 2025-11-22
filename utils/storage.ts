import {
  apiSaveHealthCheck,
  apiGetHealthChecks,
  apiGetHealthCheckById,
  apiSaveMedicationReminder,
  apiGetMedicationReminders,
  apiDeleteMedicationReminder,
  apiGetProfile,
  apiSaveProfile,
} from "@/utils/api";

export interface HealthCheck {
  id: string;
  date: string;
  symptoms: string[];
  prediction: string | null;
  medications: string[];
  nextSteps: string[];
}

export interface UserProfile {
  name: string;
  medicalHistory: string[];
  allergies: string[];
  medications: string[];
  emergencyContact?: string;
  bloodType?: string;
  lastUpdated: string;
}

export interface MedicationReminder {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  time: string;
  daysOfWeek: number[];
  enabled: boolean;
  notes?: string;
}

export async function saveHealthCheck(
  healthCheck: Omit<HealthCheck, "id">
): Promise<void> {
  try {
    await apiSaveHealthCheck({
      symptoms: healthCheck.symptoms,
      prediction: healthCheck.prediction,
      medications: healthCheck.medications,
      nextSteps: healthCheck.nextSteps,
    });
  } catch (error) {
    console.error("Failed to save health check:", error);
    throw error;
  }
}

export async function getHealthChecks(): Promise<HealthCheck[]> {
  try {
    return await apiGetHealthChecks();
  } catch (error) {
    console.error("Failed to get health checks:", error);
    return [];
  }
}

export async function getHealthCheckById(
  id: string
): Promise<HealthCheck | null> {
  try {
    return await apiGetHealthCheckById(id);
  } catch (error) {
    console.error("Failed to get health check by id:", error);
    return null;
  }
}

export async function clearAllHealthChecks(): Promise<void> {
  try {
    // Backend doesn't have bulk delete - can be added if needed
    console.log("Bulk delete not implemented");
  } catch (error) {
    console.error("Failed to clear health checks:", error);
    throw error;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await apiSaveProfile(profile);
  } catch (error) {
    console.error("Failed to save user profile:", error);
    throw error;
  }
}

export async function getUserProfile(userName: string): Promise<UserProfile> {
  try {
    const profile = await apiGetProfile();
    return profile || {
      name: userName,
      medicalHistory: [],
      allergies: [],
      medications: [],
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to get user profile:", error);
    return {
      name: userName,
      medicalHistory: [],
      allergies: [],
      medications: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function saveMedicationReminder(
  reminder: MedicationReminder
): Promise<void> {
  try {
    await apiSaveMedicationReminder(reminder);
  } catch (error) {
    console.error("Failed to save medication reminder:", error);
    throw error;
  }
}

export async function getMedicationReminders(): Promise<MedicationReminder[]> {
  try {
    return await apiGetMedicationReminders();
  } catch (error) {
    console.error("Failed to get medication reminders:", error);
    return [];
  }
}

export async function deleteMedicationReminder(id: string): Promise<void> {
  try {
    await apiDeleteMedicationReminder(id);
  } catch (error) {
    console.error("Failed to delete medication reminder:", error);
    throw error;
  }
}
