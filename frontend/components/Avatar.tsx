import { ScrollView, StyleProp, View, ViewStyle, type ScrollViewProps, Image } from 'react-native'
import { forwardRef } from 'react'

import { useThemeColor } from '@/hooks/useThemeColor'
import { Ionicons } from '@expo/vector-icons'
import { useBottomTabOverflow } from './ui/TabBarBackground'
import { useTheme } from '@/hooks'

export type AvatarProps = {
  iconUrl?: string
  size: number
  style?: StyleProp<ViewStyle>
}

export const Avatar = ({ iconUrl, size, style }: AvatarProps) => {
  const { colors } = useTheme()
  return (
    <View style={style}>
      {iconUrl ? (
        <Image 
          source={{ uri: iconUrl }}
          style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.secondaryBg }}
        />
      ) : (
        <Ionicons name="person-circle-outline" size={size} color={colors.gray} style={{ marginLeft: 4, borderRadius: size / 2 }} />
      )}
    </View>
  )
}
