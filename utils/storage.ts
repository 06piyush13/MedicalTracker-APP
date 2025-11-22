import AsyncStorage from "@react-native-async-storage/async-storage";

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

const HEALTH_CHECKS_KEY = "health_checks";
const USER_PROFILE_KEY = "user_profile";
const MEDICATION_REMINDERS_KEY = "medication_reminders";

export async function saveHealthCheck(
  healthCheck: Omit<HealthCheck, "id">
): Promise<void> {
  try {
    const existingChecks = await getHealthChecks();
    const newCheck: HealthCheck = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...healthCheck,
    };
    const updatedChecks = [newCheck, ...existingChecks];
    await AsyncStorage.setItem(HEALTH_CHECKS_KEY, JSON.stringify(updatedChecks));
  } catch (error) {
    console.error("Failed to save health check:", error);
    throw error;
  }
}

export async function getHealthChecks(): Promise<HealthCheck[]> {
  try {
    const data = await AsyncStorage.getItem(HEALTH_CHECKS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to get health checks:", error);
    return [];
  }
}

export async function getHealthCheckById(
  id: string
): Promise<HealthCheck | null> {
  try {
    const checks = await getHealthChecks();
    return checks.find((check) => check.id === id) || null;
  } catch (error) {
    console.error("Failed to get health check by id:", error);
    return null;
  }
}

export async function clearAllHealthChecks(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HEALTH_CHECKS_KEY);
  } catch (error) {
    console.error("Failed to clear health checks:", error);
    throw error;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Failed to save user profile:", error);
    throw error;
  }
}

export async function getUserProfile(userName: string): Promise<UserProfile> {
  try {
    const data = await AsyncStorage.getItem(USER_PROFILE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return {
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
    const reminders = await getMedicationReminders();
    const index = reminders.findIndex((r) => r.id === reminder.id);
    if (index >= 0) {
      reminders[index] = reminder;
    } else {
      reminders.push(reminder);
    }
    await AsyncStorage.setItem(
      MEDICATION_REMINDERS_KEY,
      JSON.stringify(reminders)
    );
  } catch (error) {
    console.error("Failed to save medication reminder:", error);
    throw error;
  }
}

export async function getMedicationReminders(): Promise<MedicationReminder[]> {
  try {
    const data = await AsyncStorage.getItem(MEDICATION_REMINDERS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to get medication reminders:", error);
    return [];
  }
}

export async function deleteMedicationReminder(id: string): Promise<void> {
  try {
    const reminders = await getMedicationReminders();
    const filtered = reminders.filter((r) => r.id !== id);
    await AsyncStorage.setItem(
      MEDICATION_REMINDERS_KEY,
      JSON.stringify(filtered)
    );
  } catch (error) {
    console.error("Failed to delete medication reminder:", error);
    throw error;
  }
}
