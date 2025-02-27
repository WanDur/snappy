import { View, Text, StyleSheet } from 'react-native'

import { useTheme } from '@/hooks'
import Themed from '@/components/themed/Themed'
import styles from './settingsbtn.style'

interface SplitButtonProps {
  title: string[]
  onPress: Array<() => void>
  status?: string[]
  split?: number
}

const SplitButton = ({ title, onPress, status, split = 2 }: SplitButtonProps) => {
  const { colors } = useTheme()

  const content = new Array(split).fill(0).map((_, i) => (
    <Themed.TouchableOpacity
      key={i}
      style={[
        styles.cardContainer,
        {
          flex: 1,
          borderRightWidth: i < split - 1 ? StyleSheet.hairlineWidth : 0,
          borderRightColor: colors.borderColor,
          justifyContent: 'center'
        }
      ]}
      onPress={onPress[i]}
      activeOpacity={0.8}
    >
      <Themed.Text style={[styles.cardTitle, { textAlign: 'center' }]}>{title[i]}</Themed.Text>
      {status && <Text style={styles.iconText}>{status[i]}</Text>}
    </Themed.TouchableOpacity>
  ))

  return <View style={{ flexDirection: 'row' }}>{content}</View>
}

export default SplitButton
