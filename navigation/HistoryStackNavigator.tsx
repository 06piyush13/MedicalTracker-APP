import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HistoryScreen from "@/screens/HistoryScreen";
import ResultsScreen from "@/screens/ResultsScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type HistoryStackParamList = {
  History: undefined;
  Results: { checkId: string };
};

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export default function HistoryStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={{ headerTitle: "Health History" }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{ headerTitle: "Results" }}
      />
    </Stack.Navigator>
  );
}
