import { View, TextInput, StyleSheet, TextInputProps, ViewStyle, TextStyle } from 'react-native'

import { useTheme } from '@/hooks'
import { ThemedText } from './ThemedText'
import { useState } from 'react'

export type ThemedTextInputProps = TextInputProps & {
  containerStyle?: ViewStyle
  inputStyle?: TextStyle
  disabled?: boolean
  variant?: 'default' | 'filled' | 'outlined' | 'ghost'
  error?: string
  label?: string
  lightColor?: string
  darkColor?: string
}

const ThemedTextInput = ({
  label,
  error,
  containerStyle,
  inputStyle,
  disabled = false,
  variant = 'default',
  ...props
}: ThemedTextInputProps) => {
  const { isDark } = useTheme()

  const [blur, setBlur] = useState(false)

  const getVariantStyle = () => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      backgroundColor: isDark ? '#2d2d37' : 'rgb(229, 229, 234)'
    }

    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: isDark ? '#3f3f46' : '#f4f4f5'
        }
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: isDark ? '#52525b' : '#e4e4e7'
        }
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent'
        }
      default:
        return baseStyle
    }
  }

  const getTextColor = () => {
    if (disabled) {
      return isDark ? '#71717a' : '#a1a1aa'
    }
    return isDark ? '#fafafa' : '#18181b'
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <ThemedText style={styles.label}>{label}</ThemedText>}
      <View style={[getVariantStyle(), disabled && styles.disabled]}>
        <TextInput
          style={[
            {
              height: 50,
              fontSize: 16,
              padding: 14,
              color: getTextColor()
            },
            inputStyle
          ]}
          placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
          editable={!disabled}
          onBlur={() => setBlur(true)}
          {...props}
        />
      </View>
      {blur && error && <ThemedText style={styles.error}>{error}</ThemedText>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  label: {
    marginBottom: 4,
    marginLeft: 4
  },
  error: {
    color: '#ef4444',
    marginTop: 4
  },
  disabled: {
    opacity: 0.5
  }
})

export default ThemedTextInput
