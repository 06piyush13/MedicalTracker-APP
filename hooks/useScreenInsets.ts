import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { Spacing } from "@/constants/theme";

export function useScreenInsets() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  // Don't try to get tab bar height - it may not exist in all contexts
  // Just use safe area insets for bottom padding
  return {
    paddingTop: headerHeight + Spacing.xl,
    paddingBottom: insets.bottom + Spacing.xl,
    scrollInsetBottom: insets.bottom + 16,
  };
}
