import { type ReactNode } from 'react'
import { View, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'

import Themed from '../themed/Themed'
import SettingsToggle from './components/SettingsToggle'
import SettingsInfoDisplay from './components/SettingsInfoDisplay'
import SettingsButton from './components/SettingsButton'
import SplitButton from './components/SplitButton'
import SettingsSelectList from './components/SettingsSelectList'
import SettingsAvatar from './components/SettingsAvatar'
import SettingsCustom from './components/SettingsCustom'
import { Colors } from '../../constants'

interface SettingsGroupProps {
  /**
   * Settings group children, should be
   *
   * `SettingsGroup.Toggle, SettingsGroup.InfoDisplay, SettingsGroup.Button, or SettingsGroup.Buttons`
   */
  children: ReactNode

  /**
   * Title of the group, will be above the group
   */
  title?: string | (() => ReactNode)

  /**
   * Footer of the group, will be under the group, act as a description for the group
   */
  footer?: string
}

const SettingsGroup = ({ children, title, footer }: SettingsGroupProps) => {
  const { t } = useTranslation()

  const renderTitle = (): ReactNode | JSX.Element | null => {
    if (typeof title === 'function') {
      return title()
    } else if (typeof title === 'string') {
      return <Themed.Text style={[styles.groupTitle]}>{t(title)}</Themed.Text>
    } else {
      return null
    }
  }

  return (
    <Themed.View style={styles.groupContainer}>
      <View style={{ marginBottom: 2, marginLeft: 8 }}>{renderTitle()}</View>

      <Themed.View
        style={styles.cardsContainer}
        lightColor={Colors.light.borderColor}
        darkColor={Colors.dark.borderColor}
      >
        {children}
      </Themed.View>
      {footer && <Themed.Text style={styles.footer}>{t(footer)}</Themed.Text>}
    </Themed.View>
  )
}

const styles = StyleSheet.create({
  groupContainer: {
    marginBottom: 24
  },
  groupTitle: {
    fontSize: 16
  },
  cardsContainer: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  footer: {
    fontSize: 10,
    marginLeft: 6
  }
})

SettingsGroup.Toggle = SettingsToggle
SettingsGroup.InfoDisplay = SettingsInfoDisplay
SettingsGroup.Button = SettingsButton
SettingsGroup.Buttons = SplitButton
SettingsGroup.SelectList = SettingsSelectList
SettingsGroup.Avatar = SettingsAvatar
SettingsGroup.Custom = SettingsCustom

export default SettingsGroup
