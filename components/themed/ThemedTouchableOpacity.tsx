import { TouchableOpacity, type TouchableOpacityProps } from 'react-native'

import { useThemeColor } from '@/hooks/useThemeColor'

export type ThemedTouchableOpacityProps = TouchableOpacityProps & {
  lightColor?: string
  darkColor?: string
  lightBorderColor?: string
  darkBorderColor?: string
}

export function ThemedTouchableOpacity({
  style,
  lightColor,
  darkColor,
  lightBorderColor,
  darkBorderColor,
  ...otherProps
}: ThemedTouchableOpacityProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'secondaryBg')
  const borderBottomColor = useThemeColor({ light: lightBorderColor, dark: darkBorderColor }, 'borderColor')

  return (
    <TouchableOpacity style={[{ backgroundColor, borderBottomColor }, style]} activeOpacity={0.7} {...otherProps} />
  )
}
