import AsyncStorage from "@react-native-async-storage/async-storage";

export interface HealthCheck {
  id: string;
  date: string;
  symptoms: string[];
  prediction: string | null;
  medications: string[];
  nextSteps: string[];
}

const HEALTH_CHECKS_KEY = "health_checks";

export async function saveHealthCheck(
  healthCheck: HealthCheck
): Promise<void> {
  try {
    const existingChecks = await getHealthChecks();
    const updatedChecks = [healthCheck, ...existingChecks];
    await AsyncStorage.setItem(
      HEALTH_CHECKS_KEY,
      JSON.stringify(updatedChecks)
    );
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
