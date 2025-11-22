import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PrivacyContextType {
  privacyMode: boolean;
  togglePrivacy: () => Promise<void>;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [privacyMode, setPrivacyMode] = useState(true);

  useEffect(() => {
    loadPrivacyPreference();
  }, []);

  const loadPrivacyPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem("privacyMode");
      if (saved !== null) {
        setPrivacyMode(saved === "true");
      } else {
        setPrivacyMode(true);
      }
    } catch (error) {
      console.error("Failed to load privacy preference:", error);
      setPrivacyMode(true);
    }
  };

  const togglePrivacy = async () => {
    try {
      const newMode = !privacyMode;
      setPrivacyMode(newMode);
      await AsyncStorage.setItem("privacyMode", String(newMode));
    } catch (error) {
      console.error("Failed to toggle privacy:", error);
    }
  };

  return (
    <PrivacyContext.Provider value={{ privacyMode, togglePrivacy }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error("usePrivacy must be used within a PrivacyProvider");
  }
  return context;
}
