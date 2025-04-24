'use client'

// @ts-expect-error: untyped helper
import RNTouchableBounce from 'react-native/Libraries/Components/Touchable/TouchableBounce'
import { TouchableOpacityProps as RNTouchableOpacityProps, View, StyleProp, ViewStyle } from 'react-native'
import * as Haptics from 'expo-haptics'
import * as React from 'react'

export type TouchableScaleProps = Omit<RNTouchableOpacityProps, 'activeOpacity' | 'style'> & {
  /** Enables haptic feedback on press down. */
  sensory?: boolean | 'success' | 'error' | 'warning' | 'light' | 'medium' | 'heavy'
  /**
   * Optional style prop that will trigger the wrapper when provided, as TouchableBounce can't apply style by default.
   * We need a wrapper with the style in order to make it works.
   * You can wrap it by yourself, or use this prop to make it easier.
   * Note when there is something wrong with the style, try to remove this prop and wrap it by yourself.
   */
  style?: StyleProp<ViewStyle>
}

/**
 * Touchable which scales the children down when pressed.
 */
export default function TouchableBounce({ style, children, onPressIn, sensory, ...props }: TouchableScaleProps) {
  const onSensory = React.useCallback(() => {
    if (!sensory) return
    if (sensory === true) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } else if (sensory === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } else if (sensory === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } else if (sensory === 'warning') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
    } else if (sensory === 'light') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    } else if (sensory === 'medium') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    } else if (sensory === 'heavy') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    }
  }, [sensory])

  const TouchableComponent = (
    <RNTouchableBounce
      {...props}
      onPressIn={(ev: any) => {
        onSensory()
        onPressIn?.(ev)
      }}
    >
      {children ? children : <View />}
    </RNTouchableBounce>
  )

  if (!style) {
    return TouchableComponent
  }

  return (
    <View style={{ flex: 1 }}>
      {React.cloneElement(TouchableComponent, {
        children: <View style={style}>{children}</View>
      })}
    </View>
  )
}
