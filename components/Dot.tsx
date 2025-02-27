import { View, ViewStyle } from 'react-native'

import { useTheme } from '@/hooks'

interface Props {
  color?: string
  size?: number
  style?: ViewStyle
}

const Dot = ({ color, style, size = 10 }: Props) => {
  const { colors } = useTheme()
  color = color || colors.text

  return (
    <View style={[style, { backgroundColor: color, height: size, width: size, borderRadius: size, marginRight: 8 }]} />
  )
}

export default Dot
