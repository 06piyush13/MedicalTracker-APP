import React from "react";
import { Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SymptomChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function SymptomChip({ label, selected, onPress }: SymptomChipProps) {
  const { theme } = useTheme();
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    opacity.value = withTiming(0.7, { duration: 100 });
  };

  const handlePressOut = () => {
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.primary : theme.backgroundDefault,
          borderColor: selected ? theme.primary : theme.border,
        },
        animatedStyle,
      ]}
    >
      <ThemedText
        style={[
          styles.text,
          {
            color: selected ? theme.buttonText : theme.textSecondary,
          },
        ]}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: 36,
    borderRadius: 18,
    paddingHorizontal: Spacing.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
  },
});
