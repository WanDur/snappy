import { TouchableOpacity, ViewStyle } from 'react-native'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks'

const ModalCloseButton = ({ style }: { style?: ViewStyle }) => {
  const router = useRouter()
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      activeOpacity={0.7}
      style={[style, { borderRadius: 20, padding: 4 }]}
    >
      <Ionicons name="close-outline" size={28} color={colors.text} />
    </TouchableOpacity>
  )
}

export default ModalCloseButton
