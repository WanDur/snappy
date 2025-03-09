import { View, ViewProps, StyleSheet } from 'react-native'

import { useThemeColor } from '@/hooks/useThemeColor'

export type ThemedViewProps = ViewProps & {
  lightColor?: string
  darkColor?: string
  type?: 'default' | 'secondary' | 'divider'
}

export function ThemedView({ style, lightColor, darkColor, type = 'default', ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    type === 'secondary' ? 'secondaryBg' : type === 'divider' ? 'borderColor' : 'background'
  )
  const height = type === 'divider' ? StyleSheet.hairlineWidth : undefined

  return <View style={[{ backgroundColor, height }, style]} {...otherProps} />
}
