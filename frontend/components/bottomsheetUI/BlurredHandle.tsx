// from https://github.com/gorhom/react-native-bottom-sheet/blob/master/example/src/screens/integrations/map/BlurredHandle.tsx
import React, { useMemo } from 'react'
import { View, StyleSheet } from 'react-native'

import { Constants } from '@/constants'
import { useTheme } from '@/hooks'

const BlurredHandle = () => {
  const { isDark } = useTheme()

  const indicatorStyle = useMemo(
    () => [
      styles.indicator,
      {
        backgroundColor: isDark ? '#8F8F8F' : '#7A7A7A'
      }
    ],
    [isDark]
  )

  return (
    <View style={styles.container}>
      <View style={indicatorStyle} />
    </View>
  )
}

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 5
  },
  indicator: {
    alignSelf: 'center',
    width: (8 * Constants.screenWidth) / 100,
    height: 5,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  }
})

export default BlurredHandle
