import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as AC from '@bacons/apple-colors'
import Animated, { interpolate, useAnimatedRef, useAnimatedStyle, useScrollViewOffset } from 'react-native-reanimated'

import { useTheme } from '@/hooks'
import { Themed } from '@/components'
import { Form, Stack } from '@/components/router-form'
import { RealName } from '@/types/profile.type'

const ProfileScreen = () => {
  const router = useRouter()

  const ref = useAnimatedRef()
  // @ts-ignore
  const scroll = useScrollViewOffset(ref)
  const style = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scroll.value, [0, 30], [0, 1], 'clamp'),
      transform: [{ translateY: interpolate(scroll.value, [0, 30], [5, 0], 'clamp') }]
    }
  })

  const { theme, colors } = useTheme()

  const formatName = (realName: RealName) => {
    return `${realName.firstName} ${realName.lastName}`
  }

  return (
    <View style={{ flex: 1 }}>
      <Themed.ScrollView ref={ref as any}>
        <Stack.Screen
          options={{
            headerTitle: () => (
              <Animated.Image
                source={{ uri: 'https://randomuser.me/api/portraits/women/32.jpg' }}
                style={[
                  style,
                  {
                    aspectRatio: 1,
                    height: 30,
                    borderRadius: 8,
                    borderWidth: 0.5,
                    borderColor: AC.separator
                  }
                ]}
              />
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
        <View style={{ gap: 24, paddingVertical: 16 }}>
          <Form.Section>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={{ uri: 'https://randomuser.me/api/portraits/women/32.jpg' }}
                style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#f0f0f0' }}
              />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Form.Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 4, color: '#333' }}>
                  Sarah Johnson
                </Form.Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="location-outline" size={14} color="#666" />
                  <Form.Text style={{ fontSize: 14, color: '#666', marginLeft: 4 }}>New York, USA</Form.Text>
                </View>
              </View>
            </View>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 4,
                borderTopWidth: 1,
                borderTopColor: '#f0f0f0'
              }}
            >
              <View style={styles.statItem}>
                <Form.Text style={styles.statNumber}>127</Form.Text>
                <Form.Text style={styles.statLabel}>Posts</Form.Text>
              </View>

              <Themed.View type="divider" />

              <View style={styles.statItem}>
                <Form.Text style={styles.statNumber}>4.8k</Form.Text>
                <Form.Text style={styles.statLabel}>Followers</Form.Text>
              </View>

              <Themed.View type="divider" />

              <View style={styles.statItem}>
                <Form.Text style={styles.statNumber}>3</Form.Text>
                <Form.Text style={styles.statLabel}>Weeks active</Form.Text>
              </View>
            </View>
          </Form.Section>

          <Form.Section title="Development screens">
            <Form.Text onPress={() => router.push('/settingscreen/DevScreen')}>Dev data</Form.Text>
            <Form.Text onPress={() => router.push('/screens/LoginScreen')}>Login screen</Form.Text>
            <Form.Text onPress={() => router.push('/(modal)/PremiumInfoModal')}>Premium Modal</Form.Text>
          </Form.Section>
        </View>
      </Themed.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2
  },
  statLabel: {
    fontSize: 12,
    color: '#666'
  }
})

export default ProfileScreen
