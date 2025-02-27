/**
 * SelectLanguageScreen.tsx
 */
import { Stack } from 'expo-router'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'

import { SettingsGroup, Themed } from '@/components'
import { useSettings } from '@/contexts'
import { Constants } from '@/constants'

const languages = [
  { label: 'English', code: 'en' },
  { label: '繁體中文', code: 'zh_HK' }
]

const SelectLanguageScreen = () => {
  const { setSetting } = useSettings()
  const { t } = useTranslation()
  const selectedIndex = languages.findIndex((lang) => i18next.language === lang.code) || 0

  const changeLanguage = async (index: number) => {
    const selectedLanguage = languages[index].code
    await i18next.changeLanguage(selectedLanguage)
    setSetting('language', selectedLanguage)
    console.log('Language changed to', selectedLanguage)
  }

  return (
    <Themed.ScrollView style={{ flex: 1, padding: 16 }}>
      <Stack.Screen
        options={{
          headerTitle: t('languages'),
          headerBackTitle: t('settings')
        }}
      />

      <SettingsGroup footer={`Your device language: ${Constants.deviceLng}, app language: ${i18next.language}`}>
        <SettingsGroup.SelectList
          options={languages.map((language) => language.label)}
          defaultSelectedIndex={selectedIndex}
          multipleSelection={false}
          onChange={(index: number) => {
            changeLanguage(index)
          }}
        />
      </SettingsGroup>
    </Themed.ScrollView>
  )
}

export default SelectLanguageScreen
