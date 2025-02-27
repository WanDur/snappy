import { Switch } from 'react-native'
import { StyleSheet, StyleProp, TextStyle, ColorValue } from 'react-native'

import Themed from '@/components/themed/Themed'
import { useTheme } from '@/hooks'

interface SettingsToggleProps {
  title: string
  value: boolean
  onValueChange: (newValue: boolean) => void
  titleTextStyle?: StyleProp<TextStyle>

  /**
   * @default '#767577'(grey): false, '#81b0ff'(blue): true
   */
  trackColor?: {
    false: ColorValue
    true: ColorValue
  }

  /**
   * @default '#eaeaea': thumbOff, '#fff': thumbOn
   */
  thumbColorOff?: ColorValue
  thumbColorOn?: ColorValue

  /**
   * On iOS, custom color for the background.
   * Can be seen when the switch value is false or when the switch is disabled.
   */
  iosBGColor?: ColorValue

  isLast?: boolean
}

const SettingsToggle = ({
  title,
  value,
  onValueChange,
  titleTextStyle,
  trackColor,
  thumbColorOff = '#eaeaea',
  thumbColorOn = '#fff',
  iosBGColor,
  isLast = false
}: SettingsToggleProps) => {
  const { colors } = useTheme()

  return (
    <Themed.View
      style={[
        styles.cardContainer,
        { borderBottomColor: colors.borderColor, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth }
      ]}
      type="secondary"
    >
      <Themed.Text style={[styles.cardTitle, titleTextStyle]}>{title}</Themed.Text>
      <Switch
        trackColor={trackColor ?? { false: '#767577', true: '#007AFF' }}
        thumbColor={value ? thumbColorOn : thumbColorOff}
        ios_backgroundColor={iosBGColor ?? '#3e3e3e'}
        onValueChange={onValueChange}
        value={value}
      />
    </Themed.View>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 50
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500'
  }
})

export default SettingsToggle
