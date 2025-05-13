import { useRouter, Stack } from 'expo-router'
import { Linking, Share, Alert, TouchableOpacity } from 'react-native'
import { useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import * as AC from '@bacons/apple-colors'

import { useTheme, useUserStore } from '@/hooks'
import { Themed } from '@/components'
import { Form } from '@/components/router-form'
import { useSession } from '@/contexts/auth'
import { UserTier } from '@/types'
//import { useSession } from '@/contexts/auth'
//import { useSync } from '@/hooks/useSync'

export default function SettingScreen() {
  const session = useSession()
  //const sync = useSync()
  const router = useRouter()
  const { colors } = useTheme()
  const { getUser } = useUserStore()

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
          headerTitle: 'Settings',
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
          <Form.Text systemImage="phone" hint={getUser().phone}>
            Phone
          </Form.Text>
          <Form.Text systemImage="mail" hint={getUser().email}>
            Email
          </Form.Text>
          {getUser().tier === UserTier.FREEMIUM && (
            <Form.Text systemImage="crown" hint="Freemium">
              Membership
            </Form.Text>
          )}
          {getUser().tier === UserTier.PREMIUM && (
            <Form.Text systemImage="crown.fill" hint="Premium">
              Membership
            </Form.Text>
          )}
          {getUser().tier === UserTier.PREMIUM && (
            <Form.Text systemImage="calendar" hint={getUser().premiumExpireTime!.toLocaleDateString()}>
              Expiry Date
            </Form.Text>
          )}
          {getUser().tier === UserTier.ADMIN && (
            <Form.Text systemImage="person.badge.shield.checkmark.fill" hint="Admin">
              Membership
            </Form.Text>
          )}
          {getUser().tier === UserTier.ADMIN && (
            <Form.Link systemImage="key.fill" href="/(modal)/GenerateCodeModal">Generate Code</Form.Link>
          )}
          {getUser().tier != UserTier.ADMIN && (
             <Form.Link systemImage="key.fill" href="/(modal)/RedeemCodeModal">Redeem Code</Form.Link>
          )}
         
        </Form.Section>

        <Form.Section title="About Snappy">
          <Form.Link href="/settingscreen/PermissionScreen" systemImage="hand.raised">
            Permissions
          </Form.Link>
          <Form.Text systemImage="star" onPress={() => {}}>
            Rate Snappy
          </Form.Text>
          <Form.Text onPress={onShare} systemImage="arrowshape.turn.up.right">
            Share Snappy
          </Form.Text>
          <Form.Text onPress={onEmail} systemImage="text.bubble" loading={loading}>
            Feedback & Suggestion
          </Form.Text>
          <Form.Text systemImage="doc.text">Terms of Service</Form.Text>
          <Form.Link href="/settingscreen/PrivacyScreen" systemImage="hand.raised">
            Privacy
          </Form.Link>
        </Form.Section>

        <Form.Section>
          <Form.Text
            systemImage="rectangle.portrait.and.arrow.right"
            onPress={() => {
              session.signOut().then(() => {
                router.dismissAll()
                router.replace('/(auth)/LoginScreen')
              })
            }}
          >
            Sign Out
          </Form.Text>
        </Form.Section>

        <Form.Section title="Debug">
          <Form.Link href="/settingscreen/DevScreen" systemImage="wrench.and.screwdriver">
            Dev data
          </Form.Link>
        </Form.Section>
      </Form.List>
    </Themed.ScrollView>
  )
}
