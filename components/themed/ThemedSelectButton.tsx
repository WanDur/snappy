import { TouchableOpacity, type TouchableOpacityProps } from 'react-native'

import { useThemeColor } from '@/hooks/useThemeColor'

export type ThemedTouchableOpacityProps = TouchableOpacityProps & {
  selected: boolean
  lightColor?: string
  darkColor?: string
  lightBorderColor?: string
  darkBorderColor?: string,
}

export function ThemedSelectButton({
  style,
  selected,
  lightColor,
  darkColor,
  lightBorderColor,
  darkBorderColor,
  ...otherProps
}: ThemedTouchableOpacityProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'secondaryBg')
  const defaultBorderColor = useThemeColor({ light: lightBorderColor, dark: darkBorderColor }, 'borderColor')
  const borderStyles = {
    borderWidth: 1.5,
    borderColor: selected ? 'tomato' : defaultBorderColor
  }

  return (
    <TouchableOpacity style={[{ backgroundColor, ...borderStyles }, style]} activeOpacity={0.7} {...otherProps} />
  )
}
