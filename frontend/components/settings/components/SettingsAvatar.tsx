import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { BlurView } from 'expo-blur'
import { Image } from 'expo-image'

import Themed from '@/components/themed/Themed'
import { useTheme, useUserStore } from '@/hooks'
import { Avatar } from '@/components/Avatar'
interface SettingsAvatarProps {
  name: string
  descirption?: string
  onPress?: () => void
  arrowText?: string
  isLast?: boolean
  displayOnly?: boolean
}

const SettingsAvatar = ({
  name,
  descirption,
  onPress,
  arrowText,
  isLast = false,
  displayOnly = false
}: SettingsAvatarProps) => {
  const router = useRouter()
  const { user } = useUserStore()
  const { theme, colors } = useTheme()

  return (
    <Themed.TouchableOpacity
      style={[
        styles.container,
        { borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth, borderColor: colors.borderColor }
      ]}
      activeOpacity={1}
      onPress={onPress}
    >
      <TouchableOpacity
        disabled={displayOnly}
        activeOpacity={0.7}
        onPress={() => router.push('/(modal)/ProfileAvatar')}
      >
        {displayOnly ? null : (
          <BlurView intensity={30} style={styles.blurred} tint={theme}>
            <FontAwesome6 name="edit" size={17} color={colors.gray} />
          </BlurView>
        )}

        <Avatar
          size={60}
          iconUrl={user.iconUrl}
        />
      </TouchableOpacity>

      <View style={{ flex: 1, gap: 6 }}>
        <Themed.Text style={styles.name}>{name}</Themed.Text>
        {descirption && <Themed.Text style={styles.descirption}>{descirption}</Themed.Text>}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Themed.Text>{arrowText}</Themed.Text>
        <MaterialIcons name="arrow-forward-ios" color={colors.gray} size={14} />
      </View>
    </Themed.TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    height: 84
  },
  blurred: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
    borderRadius: 30,
    position: 'absolute',
    zIndex: 10,
    bottom: 0,
    overflow: 'hidden',
    left: -4
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: StyleSheet.hairlineWidth * 2
  },
  name: {
    fontSize: 20
  },
  descirption: {
    fontSize: 14
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center'
  }
})

export default SettingsAvatar
