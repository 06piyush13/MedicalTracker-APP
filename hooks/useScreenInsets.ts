import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { Spacing } from "@/constants/theme";

export function useScreenInsets(options?: { hasTabBar?: boolean }) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = options?.hasTabBar ? useBottomTabBarHeight() : 0;

  return {
    paddingTop: headerHeight + Spacing.xl,
    paddingBottom: tabBarHeight > 0 ? tabBarHeight + Spacing.xl : insets.bottom + Spacing.xl,
    scrollInsetBottom: insets.bottom + 16,
  };
}
