import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { BlurView } from 'expo-blur'
import { Platform, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function BlurTabBarBackground() {
  return Platform.select({
    ios: (
      <BlurView
        // System chrome material automatically adapts to the system's theme
        // and matches the native tab bar appearance on iOS.
        tint="systemChromeMaterial"
        intensity={100}
        style={StyleSheet.absoluteFill}
      />
    ),
    android: undefined
  })
}

export function useBottomTabOverflow() {
  try {
    const tabHeight = useBottomTabBarHeight()
    const { bottom } = useSafeAreaInsets()
    return Platform.select({ ios: tabHeight - bottom, android: 0 })
  } catch (e) {
    // console.log("not in bottom tab")
    return 0
  }
}
