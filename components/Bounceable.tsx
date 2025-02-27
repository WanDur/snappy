// reference: https://github.com/WrathChaos/react-native-bounceable
/**
 * provides a bouncing effect when the user presses components wrapped by this component
 */
import React, { useState, useEffect } from 'react'
import { Animated, TouchableOpacity } from 'react-native'
import type { ViewStyle, StyleProp, TouchableOpacityProps } from 'react-native'

type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>

const AnimatedPressable = Animated.createAnimatedComponent(TouchableOpacity)

export interface IBounceableProps extends TouchableOpacityProps {
  onPress?: () => void
  bounceEffectIn?: number
  bounceEffectOut?: number
  bounceVelocityIn?: number
  bounceVelocityOut?: number
  bouncinessIn?: number
  bouncinessOut?: number
  pressTimeout?: number
  children?: React.ReactNode
  style?: CustomStyleProp
}

const Bounceable = ({
  bounceEffectIn = 0.95,
  bounceEffectOut = 1,
  bounceVelocityIn = 0.1,
  bounceVelocityOut = 0.4,
  bouncinessIn = 0,
  bouncinessOut = 0,
  pressTimeout,
  children,
  style,
  onPress,
  ...props
}: IBounceableProps) => {
  const [bounceValue] = useState(new Animated.Value(1))
  const [isPressValid, setIsPressValid] = useState(true)
  let pressTimeoutId: NodeJS.Timeout | null = null

  useEffect(() => {
    return () => {
      if (pressTimeoutId) clearTimeout(pressTimeoutId)
    }
  }, [])

  const bounceAnimation = (value: number, velocity: number, bounciness: number) => {
    Animated.spring(bounceValue, {
      toValue: value,
      velocity,
      bounciness,
      useNativeDriver: true
    }).start()
  }

  const handlePressIn = () => {
    bounceAnimation(bounceEffectIn, bounceVelocityIn, bouncinessIn)
    setIsPressValid(true)
    if (pressTimeout) {
      pressTimeoutId = setTimeout(() => {
        setIsPressValid(false)
      }, pressTimeout)
    }
  }

  const handlePressOut = () => {
    bounceAnimation(bounceEffectOut, bounceVelocityOut, bouncinessOut)
    if (pressTimeoutId) clearTimeout(pressTimeoutId)
  }

  const handlePress = () => {
    if (isPressValid && onPress) onPress()
  }

  return (
    <AnimatedPressable
      {...props}
      style={[{ transform: [{ scale: bounceValue }] }, style]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={1}
    >
      {children}
    </AnimatedPressable>
  )
}

export default Bounceable
