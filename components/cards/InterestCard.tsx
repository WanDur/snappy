import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

import Themed from '../themed/Themed'
import { useTheme } from '@/hooks'

interface InterestCardProps {
  id: number
  title: string
  selected: boolean
  onPress: () => void
}

const InterestCard = ({ title, selected, onPress }: InterestCardProps) => {
  const { colors } = useTheme()

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          borderColor: selected ? '#007AFF' : colors.borderColor,
          backgroundColor: colors.background
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="image-outline" size={40} color="#666" style={styles.icon} />
      <View style={[styles.divider, { backgroundColor: colors.borderColor }]} />
      <Themed.Text style={styles.cardTitle}>{title}</Themed.Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 0.9,
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  icon: {
    marginBottom: 8
  },
  divider: {
    width: '90%',
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
    marginBottom: 18
  },
  cardTitle: {
    fontSize: 16,
    textAlign: 'center'
  }
})

export default InterestCard
