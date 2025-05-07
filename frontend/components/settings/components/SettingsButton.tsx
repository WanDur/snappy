import React, { useEffect } from 'react'
import type { StyleProp, TextStyle } from 'react-native'
import { StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'

import Themed from '../../themed/Themed'
import styles from './settingsbtn.style'
import { Colors } from '../../../constants'
import { useTheme } from '@/hooks'

interface SettingsButtonProps {
  title: string
  onPress?: () => void

  /**
   * true to show feedback when clicked, otherwise there will be no feedback, but is still clickable
   */
  feedback?: boolean

  /**
   * A small text to display on the right side of the button.
   * Will be ignored if `icon` is provided.
   */
  hintText?: string

  /**
   * An arrow icon to display on the right side of the button.
   *
   * If hintText is provided, the arrow will be displayed after the text.
   */
  showArrow?: boolean

  /**
   * Indicates whether this button is the last element in the list.
   * If true, no bottom border will be rendered.
   */
  isLast?: boolean

  /**
   * Custom styling for the title text.
   */
  titleStyle?: StyleProp<TextStyle>

  /**
   * Custom styling for the hint text.
   */
  hintTextStyle?: StyleProp<TextStyle>

  /**
   * A React component (icon or any other element) to display at the leftmost
   * side (before the title). If both `hintText` and `icon` are provided, the icon
   * takes precedence and hintText will not be displayed.
   */
  icon?: React.ReactNode
}

const SettingsButton = ({
  title,
  onPress,
  hintText,
  feedback = true,
  showArrow = false,
  isLast = false,
  titleStyle,
  hintTextStyle,
  icon
}: SettingsButtonProps) => {
  const { colors } = useTheme()

  // Warn if both hintText and icon are provided
  useEffect(() => {
    if (hintText && icon) {
      console.warn(
        'SettingsButton: Both `hintText` and `icon` were provided. ' +
          'The `icon` will be rendered instead of the hint text.'
      )
    }
  }, [hintText, icon])

  return (
    <Themed.TouchableOpacity
      style={[styles.cardContainer, { borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth }]}
      onPress={onPress}
      activeOpacity={feedback ? 0.8 : 1}
    >
      <Themed.View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
        {icon && <Themed.View style={{ marginRight: 8, marginLeft: -2 }}>{icon}</Themed.View>}
        <Themed.Text style={[styles.cardTitle, titleStyle]}>{title}</Themed.Text>
      </Themed.View>

      {/* Row for either hint text OR icon + optional arrow */}
      <Themed.View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' }}>
        {/* If an icon is present, we skip the hintText. */}
        {!icon && hintText && (
          <Themed.Text
            style={[hintText.length > 24 ? { fontSize: 9, fontWeight: '500' } : styles.iconText, hintTextStyle]}
            lightColor={Colors.light.gray}
            darkColor={Colors.dark.gray}
          >
            {hintText}
          </Themed.Text>
        )}
        {showArrow && <MaterialIcons name="arrow-forward-ios" size={14} color={colors.gray} />}
      </Themed.View>
    </Themed.TouchableOpacity>
  )
}

export default SettingsButton
