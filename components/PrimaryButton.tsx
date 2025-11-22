import React from "react";
import { Pressable, StyleSheet, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "destructive";
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
}: PrimaryButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.textSecondary;
    if (variant === "primary") return theme.primary;
    if (variant === "destructive") return theme.error;
    return "transparent";
  };

  const getTextColor = () => {
    if (variant === "secondary") return theme.primary;
    return theme.buttonText;
  };

  const getBorderStyle = () => {
    if (variant === "secondary") {
      return {
        borderWidth: 2,
        borderColor: theme.primary,
      };
    }
    return {};
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
        },
        getBorderStyle(),
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <ThemedText
          style={[styles.text, { color: getTextColor() }]}
          numberOfLines={1}
        >
          {title}
        </ThemedText>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
