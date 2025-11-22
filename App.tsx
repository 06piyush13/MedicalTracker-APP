import React, { useEffect } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import LoginScreen from "@/screens/LoginScreen";
import CheckSymptomsScreen from "@/screens/CheckSymptomsScreen";
import ResultsScreen from "@/screens/ResultsScreen";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PrivacyProvider } from "@/contexts/PrivacyContext";
import { useTheme } from "@/hooks/useTheme";
import {
  configureNotificationHandler,
  requestNotificationPermissions,
} from "@/utils/notifications";

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  CheckSymptoms: undefined;
  Results: { symptoms: string[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    configureNotificationHandler();
    await requestNotificationPermissions();
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen
            name="CheckSymptoms"
            component={CheckSymptomsScreen}
            options={{
              presentation: "modal",
              headerShown: true,
              headerTitle: "Check Symptoms",
            }}
          />
          <Stack.Screen
            name="Results"
            component={ResultsScreen}
            options={{
              headerShown: true,
              headerTitle: "Health Analysis",
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.root}>
          <KeyboardProvider>
            <ThemeProvider>
              <PrivacyProvider>
                <AuthProvider>
                  <View style={styles.navContainer}>
                    <NavigationContainer>
                      <RootNavigator />
                    </NavigationContainer>
                  </View>
                  <StatusBar style="auto" />
                </AuthProvider>
              </PrivacyProvider>
            </ThemeProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  navContainer: {
    flex: 1,
    overflow: "hidden",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
