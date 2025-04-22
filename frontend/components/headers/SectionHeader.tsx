/**
 * SectionHeader.tsx
 */
import { View, TouchableOpacity, StyleSheet, type StyleProp, type TextStyle } from 'react-native'

import { ThemedText } from '../themed/ThemedText'

interface SectionHeaderProps {
  title: string
  buttonText?: string
  onPress?: () => void
  style?: StyleProp<TextStyle>
  buttonTextStyle?: StyleProp<TextStyle>
}

/**
 * it can be used to divide content within a screen into sections
 *
 * avoid using it for main screen header or title
 */
const SectionHeader = ({ title, buttonText, onPress, buttonTextStyle, style }: SectionHeaderProps) => {
  return (
    <View style={styles.container}>
      <ThemedText style={[styles.subHeader, style]}>{title}</ThemedText>
      {buttonText && (
        <TouchableOpacity onPress={onPress} style={{ justifyContent: 'center' }} activeOpacity={0.6}>
          <ThemedText style={[styles.buttonText, buttonTextStyle]}>{buttonText}</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  subHeader: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'left',
    marginBottom: 10
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 10,
    color: '#007bff'
  }
})

export default SectionHeader
