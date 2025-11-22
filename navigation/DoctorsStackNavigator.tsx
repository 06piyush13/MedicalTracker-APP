import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DoctorsScreen from "@/screens/DoctorsScreen";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type DoctorsStackParamList = {
  Doctors: undefined;
};

const Stack = createNativeStackNavigator<DoctorsStackParamList>();

export default function DoctorsStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Doctors"
        component={DoctorsScreen}
        options={{
          headerTitle: "Find Doctors",
          headerTransparent: true,
          headerBlurEffect: "systemMaterial",
        }}
      />
    </Stack.Navigator>
  );
}
