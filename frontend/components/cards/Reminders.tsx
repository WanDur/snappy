import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'

import Bounceable from '../Bounceable'
import Themed from '../themed/Themed'
import { useTheme } from '@/hooks'

interface RemindersProps {
  title: string
  footer: string | number
  eventType: '📅' | '🎂' | '⏳'
  icon?: any
}

const Reminders = ({ title, footer, eventType, icon }: RemindersProps) => {
  const router = useRouter()
  const { colors } = useTheme()

  const _footer =
    typeof footer === 'number'
      ? new Date(footer).toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : footer

  return (
    <Bounceable style={[styles.container, { backgroundColor: colors.secondaryBg }]}>
      <View style={{ width: 50, height: 50, backgroundColor: '#eaeaea', borderRadius: 30 }} />

      <View style={{ flex: 1, gap: 6 }}>
        <Themed.Text style={{ fontWeight: '600' }}>{title}</Themed.Text>
        <Themed.Text style={{ color: 'grey', fontSize: 14 }}>{_footer}</Themed.Text>
      </View>

      <View style={{ marginRight: 6, alignItems: 'flex-end' }}>
        <Themed.Text>{eventType}</Themed.Text>
      </View>
    </Bounceable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 8,
    borderRadius: 10
  },
  iconContainer: {
    position: 'relative',
    marginRight: 10,
    marginLeft: -10
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingBottom: 4
  },
  date: {
    fontSize: 14,
    color: '#666'
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold'
  }
})

export default Reminders
