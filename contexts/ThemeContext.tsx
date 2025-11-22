import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "@/hooks/useColorScheme";

type ColorScheme = "light" | "dark";

interface ThemeContextType {
  colorScheme: ColorScheme;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    systemColorScheme ?? "light"
  );

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const saved = await AsyncStorage.getItem("themePreference");
      if (saved === "dark" || saved === "light") {
        setColorScheme(saved);
      } else {
        setColorScheme(systemColorScheme ?? "light");
      }
    } catch (error) {
      console.error("Failed to load theme preference:", error);
      setColorScheme(systemColorScheme ?? "light");
    }
  };

  const toggleTheme = async () => {
    try {
      const newScheme = colorScheme === "dark" ? "light" : "dark";
      setColorScheme(newScheme);
      await AsyncStorage.setItem("themePreference", newScheme);
    } catch (error) {
      console.error("Failed to toggle theme:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
