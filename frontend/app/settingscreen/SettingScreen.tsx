import { useRouter, Stack } from 'expo-router'
import { Linking, Share, Alert, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

import { useTheme } from '@/hooks'
import { SettingsGroup, Themed } from '@/components'
//import { useSession } from '@/contexts/auth'
//import { useSync } from '@/hooks/useSync'

export default function SettingScreen() {
  //const session = useSession()
  //const sync = useSync()
  const router = useRouter()
  const { colors } = useTheme()
  const { t } = useTranslation()

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: 'MESSAGE'
      })
    } catch (error: any) {
      Alert.alert(error.message)
    }
  }

  return (
    <Themed.ScrollView style={{ padding: 16 }}>
      <Stack.Screen
        options={{
          headerTitle: t('settings'),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                router.back()
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={26} color={colors.text} style={{ marginRight: 20 }} />
            </TouchableOpacity>
          )
        }}
      />
      <SettingsGroup title="general">
        <SettingsGroup.Button
          title="notifications"
          onPress={() => router.push('/settingscreen/NotificationScreen')}
          showArrow
        />
        <SettingsGroup.Button
          title="languages"
          onPress={() => router.push('/settingscreen/SelectLanguageScreen')}
          showArrow
        />
        <SettingsGroup.Button
          title="permissions.title"
          onPress={() => router.push('/settingscreen/PermissionScreen')}
          showArrow
        />
      </SettingsGroup>

      <SettingsGroup
        title={() => (
          <Themed.Text style={{ fontSize: 16 }}>
            About <Themed.Text style={{ fontSize: 16, fontWeight: '500' }}>Snappy</Themed.Text>
          </Themed.Text>
        )}
      >
        <SettingsGroup.Button title="Rate Snappy" />
        <SettingsGroup.Button title="Share Snappy" onPress={onShare} />
        <SettingsGroup.Button
          title="Feedback & Suggestion"
          onPress={() => Linking.openURL('mailto:support@example.com?subject=Feedback%20and%20Suggestion')}
          isLast
        />
      </SettingsGroup>

      <SettingsGroup title="Debug">
        <SettingsGroup.Button title="Dev data" onPress={() => router.push('/settingscreen/DevScreen')} showArrow />
        <SettingsGroup.Button
          title="Sign out"
          isLast
          onPress={() => {
            return
            sync.cleanUp()
            session.signOut().then(() => {
              router.back()
              router.replace('/screens/LoginScreen')
            })
          }}
        />
      </SettingsGroup>
    </Themed.ScrollView>
  )
}
