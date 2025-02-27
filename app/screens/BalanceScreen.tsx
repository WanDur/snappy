import { View, StyleSheet } from 'react-native'
import { Stack } from 'expo-router'
import { PieChart } from 'react-native-gifted-charts'

import { useTheme } from '@/hooks'
import { SettingsGroup, Themed, Dot } from '@/components'
import { Colors } from '@/constants'

interface Props {
  data: { value: number; color: string; gradientCenterColor: string; label: string }[]
}

const ChartLegend = ({ data }: Props) => {
  return (
    <View style={{ marginVertical: 10 }}>
      {data.map(
        (item, index) =>
          item.value !== 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }} key={index}>
              <Dot color={item.color} />
              <Themed.Text>
                HKD <Themed.Text style={{ color: item.color, fontWeight: '700' }}>{item.value} </Themed.Text>
                {item.label}
              </Themed.Text>
            </View>
          )
      )}
    </View>
  )
}

const BalanceScreen = () => {
  const { isDark } = useTheme()
  const balanceData = [
    {
      value: 300,
      color: isDark ? '#054f07' : '#06beb6',
      gradientCenterColor: isDark ? '#bdc4bc' : '#cfe6e5',
      label: 'withdrawable'
    },
    {
      value: 150,
      color: isDark ? '#42275a' : '#8F80F3',
      gradientCenterColor: isDark ? '#734b6d' : '#e3defa',
      label: 'on hold'
    },
    {
      value: 50,
      color: isDark ? '#aa076b' : '#ff99b1',
      gradientCenterColor: isDark ? '#61045f' : '#fff2f5',
      label: 'pending desposit'
    }
  ]

  return (
    <Themed.View style={{ flex: 1, padding: 16 }}>
      <Stack.Screen options={{ headerTitle: 'My balance', headerBackTitle: 'Profile' }} />
      <View style={{ alignItems: 'center', marginTop: 10 }}>
        <PieChart
          data={balanceData}
          donut
          innerCircleColor={isDark ? Colors.dark.background : Colors.light.background}
          showGradient
          radius={90}
          innerRadius={60}
          centerLabelComponent={() => {
            return (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Themed.Text style={{ fontSize: 22, fontWeight: 'bold' }}>500.0</Themed.Text>
                <Themed.Text style={{ fontSize: 14 }}>HKD</Themed.Text>
              </View>
            )
          }}
        />
        <ChartLegend data={balanceData} />
      </View>
      <SettingsGroup title="Actions">
        <SettingsGroup.Button title="Withdraw" showArrow />
        <SettingsGroup.Button title="View transactions" showArrow />
        <SettingsGroup.Button title="Manage payment" showArrow isLast />
      </SettingsGroup>
    </Themed.View>
  )
}

const styles = StyleSheet.create({
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    marginRight: 10
  }
})

export default BalanceScreen
