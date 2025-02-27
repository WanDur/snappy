import React from 'react'
import { StyleSheet, StyleProp, TextStyle } from 'react-native'

import { useTheme } from '@/hooks'
import Themed from '../../themed/Themed'
import { Colors } from '../../../constants'
import styles from './settingsinfodisplay.style'

type InfoDisplayTypes = 'bool' | 'string'

interface SettingsInfoDisplayProps {
  /**
   * text displayed at the left side of the component.
   */
  title: string

  /**
   * The info to be shown on the right side of the component.
   *
   * if boolean is provided, the component will display 'Enabled' or 'Disabled' based on the value.
   * you can change the text by providing `customBoolText`.
   *
   * if string is provided, it will be rendered directly as the info.
   */
  stateValue: boolean | string

  /**
   *  The type of information being displayed. `bool` or `string`.
   *
   * bool: for settings that have two-sided state. The component will display Enabled/Disabled or custom text based on `customBoolText`.
   *
   * string: for settings that display one specific value. The component will display the string provided in `stateValue`.
   *
   * Defaults to `bool`
   */
  type?: InfoDisplayTypes

  /**
   * Indicates whether this component is the last element in the list.
   * If true, no bottom border will be rendered.
   */
  isLast?: boolean

  /**
   * Custom text to display for the true and false states when 'type' is bool.
   */
  customBoolText?: { true: string; false: string }
  titleStyle?: StyleProp<TextStyle>
  /**
   * @default statusText: {
        fontSize: 16,
        fontWeight: '500',
        alignSelf: 'center'
    }
   */
  statusStyle?: StyleProp<TextStyle>
}

const getStatusText = (
  status: boolean | string,
  type: InfoDisplayTypes,
  customText?: { true: string; false: string }
) => {
  if (type === 'bool') {
    // Use the custom text if provided, else default to 'Enabled'/'Disabled'
    return status ? customText?.true ?? 'Enabled' : customText?.false ?? 'Disabled'
  }
  // If type is 'string', simply return it
  if (status) return status.toString()
  else return 'ERROR - NO VALUE'
}

const SettingsInfoDisplay = ({
  title,
  stateValue,
  type = 'bool',
  isLast = false,
  customBoolText,
  titleStyle,
  statusStyle
}: SettingsInfoDisplayProps) => {
  if (type === 'string' && customBoolText) {
    console.info(
      `[WARNING][SettingsInfoDisplay][${title}] type provided is string, you only need customBoolText when type is bool, check if you are using it correctly.`
    )
  }
  if (typeof stateValue === 'string' && type === 'bool') {
    if (customBoolText) {
      console.info(
        `[WARNING][SettingsInfoDisplay][${title}] stateValue is a string, but type is bool. This will always render '${customBoolText.true}'.`
      )
    } else {
      console.info(
        `[WARNING][SettingsInfoDisplay][${title}] stateValue is a string, but type is bool. This will always render 'Enabled'.`
      )
    }
  }

  const { colors } = useTheme()
  const displayStatus = getStatusText(stateValue, type, customBoolText)

  return (
    <Themed.View
      style={[
        styles.container,
        { borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth, borderBottomColor: colors.borderColor }
      ]}
      lightColor={Colors.light.secondaryBg}
      darkColor={Colors.dark.secondaryBg}
    >
      <Themed.Text style={[styles.infoTitleText, titleStyle]}>{title}</Themed.Text>
      <Themed.Text
        style={[styles.statusText, statusStyle, displayStatus.length > 30 ? { fontSize: 9 } : {}]}
        lightColor={Colors.light.gray}
        darkColor={Colors.dark.gray}
      >
        {displayStatus}
      </Themed.Text>
    </Themed.View>
  )
}

export default SettingsInfoDisplay
