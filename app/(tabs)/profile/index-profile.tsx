import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useEffect, useState } from 'react'
import { BlurView } from 'expo-blur'
import { useRouter, Stack } from 'expo-router'
import { Ionicons, Feather } from '@expo/vector-icons'

import { useTheme, useProfileStore } from '@/hooks'
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground'
import { Themed, SettingsGroup } from '@/components'
// import { useSession } from '@/contexts/auth'
import { RealName } from '@/types/profile.type'
import { Constants } from '@/constants'

const ProfileScreen = () => {
  const router = useRouter()
  // const session = useSession()

  const { profile } = useProfileStore()
  const { theme, colors } = useTheme()
  const overflow = useBottomTabOverflow()

  const formatName = (realName: RealName) => {
    return `${realName.firstName} ${realName.lastName}`
  }

  const [name, setName] = useState(formatName(profile.user.realName!))

  const actions = [
    {
      name: 'View all',
      icon: 'archive',
      onPress: () => router.push({ pathname: '/screens/OrderScreen', params: { paramFilter: 'all' } })
    },
    {
      name: 'In Progress',
      icon: 'clock',
      onPress: () => router.push({ pathname: '/screens/OrderScreen', params: { paramFilter: 'in-progress' } })
    },
    {
      name: 'Pending',
      icon: 'activity',
      onPress: () => router.push({ pathname: '/screens/OrderScreen', params: { paramFilter: 'Pending' } })
    },
    {
      name: 'Finished',
      icon: 'check-circle',
      onPress: () => router.push({ pathname: '/screens/OrderScreen', params: { paramFilter: 'finished' } })
    }
  ]

  const fetchUserProfile = async () => {
    return
    if (!session.session) return
    const userInfoRes = await session.apiWithToken.get('/panda/user/info')
    profile.user.realName = userInfoRes.data.realName
    profile.user.username = userInfoRes.data.username
    profile.user._id = userInfoRes.data.userId
    setName(formatName(profile.user.realName!))
  }

  useEffect(() => {
    fetchUserProfile()
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <Themed.ScrollView style={{ padding: 16 }}>
        <Stack.Screen
          options={{
            headerTitle: () => (
              <Themed.Text style={{ fontWeight: '700', fontSize: 16 }}>{`@${
                profile.user.username || 'guest'
              }`}</Themed.Text>
            ),
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <TouchableOpacity onPress={() => router.push('/settingscreen/SettingScreen')}>
                  <Ionicons name="settings-outline" style={{ marginRight: 6, color: colors.text }} size={24} />
                </TouchableOpacity>
              </View>
            )
          }}
        />

        <SettingsGroup title="">
          <SettingsGroup.Avatar
            name={name.trim() || 'Guest'}
            descirption="Edit profile"
            onPress={() => router.push('/(tabs)/profile/ProfileDetailScreen')}
          />
          <SettingsGroup.Button
            title="Account"
            onPress={() => router.push('/(tabs)/profile/AccountDetailScreen')}
            showArrow
            isLast
          />
        </SettingsGroup>

        <SettingsGroup title="Collections">
          <SettingsGroup.Button title="Saved jobs" onPress={() => router.push('/screens/SavedJobScreen')} showArrow />
          <SettingsGroup.Button
            title="My interests"
            onPress={() => router.push('/screens/SelectInterestScreen')}
            showArrow
            isLast
          />
        </SettingsGroup>

        <SettingsGroup title="Manage orders">
          <SettingsGroup.Custom isLast>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', gap: 10 }}>
              {actions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={{ alignItems: 'center' }}
                  activeOpacity={0.7}
                  onPress={action.onPress}
                >
                  <Feather name={action.icon as any} size={24} color={colors.text} />

                  <Themed.Text style={{ marginTop: 8, fontSize: 13, textAlign: 'center' }}>{action.name}</Themed.Text>
                </TouchableOpacity>
              ))}
            </View>
          </SettingsGroup.Custom>
        </SettingsGroup>

        <SettingsGroup title="Development screens">
          <SettingsGroup.Button title="Dev data" onPress={() => router.push('/settingscreen/DevScreen')} showArrow />
          <SettingsGroup.Button title="PostJobScreen" onPress={() => router.push('/postJob')} showArrow />
          <SettingsGroup.Button
            title="Login screen"
            onPress={() => router.push('/screens/LoginScreen')}
            showArrow
            isLast
          />
        </SettingsGroup>
      </Themed.ScrollView>

      {/*  Floating Button  */}
      <TouchableOpacity
        style={[
          styles.balanceContainer,
          { borderColor: colors.borderColor, bottom: overflow! * 2 + (Constants.isIOS ? 0 : 10) }
        ]}
        activeOpacity={1}
        onPress={() => router.push('/screens/BalanceScreen')}
      >
        <BlurView intensity={Constants.isIOS ? 20 : 100} tint={theme} style={StyleSheet.absoluteFill} />

        <View style={styles.balanceContent}>
          <Ionicons name="wallet-outline" size={28} color={colors.text} style={{ marginBottom: 6 }} />
          <Themed.Text style={styles.balanceText}>Balance</Themed.Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  balanceContainer: {
    position: 'absolute',
    right: 16,
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden'
  },
  balanceContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  balanceText: {
    fontSize: 13,
    textAlign: 'center'
  }
})

export default ProfileScreen
