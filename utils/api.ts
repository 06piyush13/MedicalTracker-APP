import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://localhost:3000";
let authToken = "";
let apiAvailable = true;

export async function initializeAPI() {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      authToken = token;
    }
    // Test API connectivity
    await testAPI();
  } catch (error) {
    console.log("API initialization note:", error);
  }
}

async function testAPI() {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "test" }),
      timeout: 2000,
    });
    apiAvailable = response.ok || response.status === 500;
  } catch {
    apiAvailable = false;
  }
}

export function setAuthToken(token: string) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

async function request(endpoint: string, options: any = {}) {
  const headers: any = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      timeout: 5000,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    apiAvailable = false;
    throw error;
  }
}

// Auth
export async function apiLogin(name: string, password: string = "default") {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ name, password }),
  });
  authToken = data.token;
  await AsyncStorage.setItem("authToken", data.token);
  return data;
}

// Health Checks
export async function apiSaveHealthCheck(healthCheck: any) {
  return request("/api/health-checks", {
    method: "POST",
    body: JSON.stringify(healthCheck),
  });
}

export async function apiGetHealthChecks() {
  return request("/api/health-checks", { method: "GET" });
}

export async function apiGetHealthCheckById(id: string) {
  return request(`/api/health-checks/${id}`, { method: "GET" });
}

// Medications
export async function apiSaveMedicationReminder(reminder: any) {
  if (reminder.id && reminder.id.includes("-")) {
    // New reminder
    return request("/api/medications", {
      method: "POST",
      body: JSON.stringify(reminder),
    });
  } else {
    // Existing reminder
    return request(`/api/medications/${reminder.id}`, {
      method: "PUT",
      body: JSON.stringify(reminder),
    });
  }
}

export async function apiGetMedicationReminders() {
  return request("/api/medications", { method: "GET" });
}

export async function apiDeleteMedicationReminder(id: string) {
  return request(`/api/medications/${id}`, { method: "DELETE" });
}

// Profile
export async function apiGetProfile() {
  return request("/api/profile", { method: "GET" });
}

export async function apiSaveProfile(profile: any) {
  return request("/api/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}
