import { Text, type TextProps, StyleSheet } from 'react-native'

import { useThemeColor } from '@/hooks/useThemeColor'

export type ThemedTextProps = TextProps & {
  lightColor?: string
  darkColor?: string
  type?: 'default' | 'title' | 'subtitle' | 'link' | 'grey' | 'headerButton'
  state?: boolean
  /**
   * 30% intensity
   */
  text30?: boolean
  /**
   * 50% intensity
   */
  text50?: boolean
  /**
   * 70% intensity
   */
  text70?: boolean
  /**
   * 90% intensity
   */
  text90?: boolean
}

export function ThemedText({
  style,
  lightColor,
  darkColor,
  state,
  type = 'default',
  text30,
  text50,
  text70,
  text90,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text')
  const themeType = useThemeColor({}, 'background') === '#fff' ? 'light' : 'dark'

  let textColor = color
  if (text30) {
    textColor = themeType === 'light' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'
  } else if (text50) {
    textColor = themeType === 'light' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)'
  } else if (text70) {
    textColor = themeType === 'light' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'
  } else if (text90) {
    textColor = themeType === 'light' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)'
  } else if (type === 'grey') {
    textColor = 'grey'
  } else if (type === 'headerButton') {
    textColor = state ? '#007AFF' : 'grey'
  }

  return (
    <Text
      style={[
        { color: textColor },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'headerButton' ? { fontSize: 16, fontWeight: '500' } : undefined,
        style
      ]}
      {...rest}
    />
  )
}

const styles = StyleSheet.create({
  default: {
    fontSize: 14
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600'
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#007AFF'
  }
})
