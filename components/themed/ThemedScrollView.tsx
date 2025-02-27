import { ScrollView, type ScrollViewProps } from 'react-native'
import { forwardRef } from 'react'

import { useThemeColor } from '@/hooks/useThemeColor'
import { useBottomTabOverflow } from '../ui/TabBarBackground'

export type ThemedScrollViewProps = ScrollViewProps & {
  lightColor?: string
  darkColor?: string
  /**
   * If true, the scroll view will have a bottom padding to avoid content covered by the tab bar
   *
   * when the screen doesnt have a tab bar, better set this to false
   * @default true
   */
  haveTabBar?: boolean
  /**
   * Extra padding to add to the bottom of the scroll view
   * only works when `haveTabBar` is true
   */
  extraPadding?: number
}

export const ThemedScrollView = forwardRef<ScrollView, ThemedScrollViewProps>(
  ({ style, lightColor, darkColor, haveTabBar = true, extraPadding = 0, ...otherProps }, ref) => {
    const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background')
    const tabBarHeight = useBottomTabOverflow()

    return (
      <ScrollView
        ref={ref}
        style={[{ backgroundColor }, style]}
        contentContainerStyle={{ paddingBottom: haveTabBar ? tabBarHeight! + extraPadding : 0 }}
        {...otherProps}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      />
    )
  }
)
