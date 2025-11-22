import AsyncStorage from "@react-native-async-storage/async-storage";

// For web, use the current domain, for native, use localhost
const getAPIURL = () => {
  if (typeof window !== "undefined" && window.location) {
    // We're in a web browser - use relative path or full domain
    const host = window.location.hostname;
    const isLocalhost = host === "localhost" || host === "127.0.0.1";
    if (isLocalhost) {
      return "http://localhost:3000";
    }
    // We're on a remote server, use HTTPS with the same domain
    return `https://${host}:3000`;
  }
  return process.env.REACT_APP_API_URL || "http://localhost:3000";
};

const API_URL = getAPIURL();

let authToken = "";

export async function initializeAPI() {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      authToken = token;
    }
  } catch (error) {
    console.error("Failed to initialize API:", error);
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
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
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
