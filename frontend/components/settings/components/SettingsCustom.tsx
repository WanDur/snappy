import React from 'react'
import { StyleSheet, ViewStyle, StyleProp } from 'react-native'

import { useTheme } from '@/hooks'
import Themed from '../../themed/Themed'

interface SettingsCustomProps {
  /**
   * children represent any custom UI you want to place in this slot.
   */
  children: React.ReactNode
  /**
   * Determines whether this is the last element in a settings group.
   * If true, no bottom border will be rendered.
   */
  isLast?: boolean
  /**
   * Optional style for overriding or extending container styles.
   */
  containerStyle?: StyleProp<ViewStyle>
  /**
   * indicates if the custom component is a button
   */
  isButton?: boolean
}

const SettingsCustom = ({ children, isLast = false, containerStyle, isButton = false }: SettingsCustomProps) => {
  const { colors } = useTheme()
  const Container = isButton ? Themed.TouchableOpacity : Themed.View

  return (
    <Container
      style={[
        styles.container,
        containerStyle,
        { borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth, borderColor: colors.borderColor }
      ]}
      type="secondary"
      activeOpacity={0.8}
    >
      {children}
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16
  }
})

export default SettingsCustom
