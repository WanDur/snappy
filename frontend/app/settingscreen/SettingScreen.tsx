import { useRouter, Stack } from 'expo-router'
import { Linking, Share, Alert, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

import { useTheme } from '@/hooks'
import { Themed } from '@/components'
import { Form } from '@/components/router-form'
//import { useSession } from '@/contexts/auth'
//import { useSync } from '@/hooks/useSync'

export default function SettingScreen() {
  //const session = useSession()
  //const sync = useSync()
  const router = useRouter()
  const { colors } = useTheme()
  const { t } = useTranslation()

  const [loading, setLoading] = useState(false)

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: 'MESSAGE'
      })
    } catch (error: any) {
      Alert.alert(error.message)
    }
  }

  const onEmail = () => {
    setLoading(true)
    Linking.openURL('mailto:support@example.com?subject=Feedback%20and%20Suggestion')
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  return (
    <Themed.ScrollView>
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
      <Form.List>
        <Form.Section title="general">
          <Form.Link href="/settingscreen/NotificationScreen" systemImage="bell">
            {t('notifications')}
          </Form.Link>
          <Form.Link href="/settingscreen/SelectLanguageScreen" systemImage="globe">
            {t('languages')}
          </Form.Link>
          <Form.Link href="/settingscreen/PermissionScreen" systemImage="hand.raised">
            {t('permissions.title')}
          </Form.Link>
        </Form.Section>

        <Form.Section title="Account">
          <Form.Text systemImage="phone">Phone</Form.Text>
          <Form.Text systemImage="trash">Delete Account</Form.Text>
          <Form.Text systemImage="rectangle.portrait.and.arrow.right">Sign Out</Form.Text>
        </Form.Section>

        <Form.Section title="About Snappy">
          <Form.Text systemImage="star" onPress={() => {}}>
            Rate Snappy
          </Form.Text>
          <Form.Text onPress={onShare} systemImage="arrowshape.turn.up.right">
            Share Snappy
          </Form.Text>
          <Form.Text onPress={onEmail} systemImage="text.bubble" loading={loading}>
            Feedback & Suggestion
          </Form.Text>
        </Form.Section>

        <Form.Section title="Debug">
          <Form.Link href="/settingscreen/DevScreen" systemImage="wrench.and.screwdriver">
            Dev data
          </Form.Link>
          <Form.Link
            href="/#"
            onPress={() => {
              /*
              session.signOut().then(() => {
                router.back()
                router.replace('/screens/LoginScreen')
              })
            */
            }}
            systemImage="rectangle.portrait.and.arrow.right"
          >
            Sign out
          </Form.Link>
        </Form.Section>
      </Form.List>
    </Themed.ScrollView>
  )
}
