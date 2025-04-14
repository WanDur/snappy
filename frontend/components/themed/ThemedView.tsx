import { View, ViewProps, StyleSheet } from 'react-native'

import { useThemeColor } from '@/hooks/useThemeColor'

export type ThemedViewProps = ViewProps & {
  lightColor?: string
  darkColor?: string
  type?: 'default' | 'secondary' | 'divider'
  /**
   * automatically add shadowOffset to the view
   * and set shadowColor according to the theme
   */
  shadow?: boolean
}

export function ThemedView({ style, lightColor, darkColor, type = 'default', shadow, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    type === 'secondary' ? 'secondaryBg' : type === 'divider' ? 'borderColor' : 'background'
  )
  const height = type === 'divider' ? StyleSheet.hairlineWidth : undefined

  const shadowOffset = shadow ? { width: 0, height: 0 } : undefined
  const shadowColor = shadow ? useThemeColor({}, 'text') : undefined

  return <View style={[{ backgroundColor, height, shadowOffset, shadowColor }, style]} {...otherProps} />
}
