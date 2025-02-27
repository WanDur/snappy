import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import { AntDesign } from '@expo/vector-icons'
import Animated, { FadeIn, FadeOut, LinearTransition, useAnimatedStyle, withTiming } from 'react-native-reanimated'

import { useTheme } from '@/hooks'
import { Colors } from '@/constants'

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

interface CheckBoxProps {
  name: string
  checked: boolean
  onPress: () => void
  style?: ViewStyle
  hideCheck?: boolean
}

const CheckBox = ({ name, checked, onPress, style, hideCheck = false }: CheckBoxProps) => {
  const { theme } = useTheme()

  const rContainerStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(checked ? '#FF6347' + '44' : 'transparent', { duration: 100 }),
      borderColor: withTiming(checked ? 'tomato' : Colors[theme].borderColor, { duration: 100 })
    }
  }, [checked])

  const tTextStyle = useAnimatedStyle(() => {
    return {
      color: withTiming(checked ? 'red' : Colors[theme].text, { duration: 100 })
    }
  }, [checked])

  return (
    <AnimatedTouchableOpacity
      style={[styles.container, style, rContainerStyle]}
      onPress={onPress}
      layout={LinearTransition.springify().mass(0.2)}
      activeOpacity={1}
    >
      <Animated.Text style={[styles.label, tTextStyle]}>{name}</Animated.Text>
      {!hideCheck && checked && (
        <Animated.View style={styles.icon} entering={FadeIn.duration(300)} exiting={FadeOut}>
          <AntDesign name="checkcircle" size={14} color={'tomato'} />
        </Animated.View>
      )}
    </AnimatedTouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  label: {
    fontSize: 14
  },
  icon: {
    marginLeft: 6,
    height: 14,
    width: 14
  }
})

export default CheckBox
