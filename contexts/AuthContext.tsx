import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiLogin, initializeAPI, setAuthToken, getAuthToken } from "@/utils/api";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userName: string;
  login: (name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      await initializeAPI();
      const token = getAuthToken();
      const name = await AsyncStorage.getItem("userName");
      if (token && name) {
        setUserName(name);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Failed to check auth status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (name: string) => {
    try {
      const response = await apiLogin(name);
      await AsyncStorage.setItem("userName", name);
      setUserName(name);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Failed to login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("userName");
      await AsyncStorage.removeItem("authToken");
      setAuthToken("");
      setUserName("");
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Failed to logout:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, userName, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
