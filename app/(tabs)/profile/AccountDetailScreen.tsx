import { View, StyleSheet } from 'react-native'
import { useState } from 'react'
import { PieChart } from 'react-native-gifted-charts'

import { Themed, SettingsGroup } from '@/components'
import { useProfileStore, useTheme } from '@/hooks'

const AccountDetailScreen = () => {
  const { profile } = useProfileStore()
  const { colors } = useTheme()

  const [score, setScore] = useState(70)

  return (
    <Themed.ScrollView style={{ padding: 16, paddingTop: 0 }}>
      <SettingsGroup title="Account info">
        <SettingsGroup.Custom isButton>
          <Themed.Text style={styles.field}>Username</Themed.Text>
          <Themed.Text style={styles.value}>{profile.user.username || '@guest'}</Themed.Text>
        </SettingsGroup.Custom>
        <SettingsGroup.Custom isButton>
          <Themed.Text style={styles.field}>Email</Themed.Text>
          <Themed.Text style={styles.value}>{profile.user.email || 'Not Set Up'}</Themed.Text>
        </SettingsGroup.Custom>
        <SettingsGroup.Custom containerStyle={{ flexDirection: 'row', justifyContent: 'space-between' }} isLast>
          <View>
            <Themed.Text style={styles.field}>My reputation</Themed.Text>
            <Themed.Text style={styles.value}>Good</Themed.Text>
          </View>

          <PieChart
            data={[
              { value: score, color: '#177AD5', gradientCenterColor: 'white' },
              { value: 100 - score, color: 'lightgray', gradientCenterColor: 'white' }
            ]}
            showGradient
            donut
            radius={24}
            innerRadius={18}
            innerCircleColor={colors.secondaryBg}
            centerLabelComponent={() => <Themed.Text style={{ fontWeight: '600' }}>{score}</Themed.Text>}
          />
        </SettingsGroup.Custom>
      </SettingsGroup>

      <SettingsGroup title="Account management">
        <SettingsGroup.Button title="Delete my account" onPress={() => {}} />
        <SettingsGroup.Button title="Privacy" onPress={() => {}} isLast />
      </SettingsGroup>

      <SettingsGroup title="">
        <SettingsGroup.Button title="Logout" onPress={() => {}} isLast />
      </SettingsGroup>
    </Themed.ScrollView>
  )
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 6
  },
  value: {
    fontSize: 17,
    fontWeight: '600'
  }
})

export default AccountDetailScreen
