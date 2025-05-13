import { ScrollView, StyleProp, View, ViewStyle, type ScrollViewProps, Image } from 'react-native'
import { forwardRef } from 'react'

import { useThemeColor } from '@/hooks/useThemeColor'
import { Ionicons } from '@expo/vector-icons'
import { useBottomTabOverflow } from './ui/TabBarBackground'
import { useTheme } from '@/hooks'
import { Themed } from '.'

export type AvatarProps = {
  username?: string
  iconUrl?: string
  size: number
  style?: StyleProp<ViewStyle>
}

export const Avatar = ({ iconUrl, username, size, style }: AvatarProps) => {
  const { colors } = useTheme()
  return (
    <View style={style}>
      {iconUrl ? (
        <Image 
          source={{ uri: iconUrl }}
          style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.secondaryBg }}
        />
      ) : (
        username ? (
          <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.secondaryBg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderColor }}>
            <Themed.Text style={{ fontSize: size * 0.3, color: colors.text }}>{username?.slice(0, 2)}</Themed.Text>
          </View>
        ) : (
          <Ionicons name="person-circle-outline" size={size} color={colors.gray} />
        )
      )}
    </View>
  )
}
