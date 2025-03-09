import React, { useState, useCallback } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  ReduceMotion,
  withSequence,
  Easing,
  withTiming,
  withRepeat
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks'
import Themed from './themed/Themed'

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

interface ExpandableRowProps {
  iconName: string
  iconSize?: number
  title: string
  onAddPress?: () => void
  children?: React.ReactNode
  hideButton?: boolean
  isExpanded?: boolean
  isUpload?: boolean
  isEdit?: boolean
  subtitle?: string | React.ReactNode
}

const ExpandableRow = ({
  iconName,
  title,
  onAddPress,
  children,
  hideButton = false,
  isExpanded = false,
  isEdit = false,
  isUpload = false,
  iconSize = 26,
  subtitle
}: ExpandableRowProps) => {
  const { colors } = useTheme()
  const expanded = useSharedValue(isExpanded ? 1 : 0)
  const shakeTranslateX = useSharedValue(0)
  const [childrenHeight, setChildrenHeight] = useState(100)
  const [_expanded, _setExpanded] = useState(isExpanded)

  const toggleExpand = () => {
    if (children === undefined || children === null) {
      shake()
      return
    }
    expanded.value = expanded.value ? 0 : 1
    _setExpanded((prev) => !prev)
  }

  const rChildrenContainerStyle = useAnimatedStyle(() => ({
    height: withSpring(expanded.value ? childrenHeight + 16 : 0, {
      mass: 1,
      damping: 18,
      stiffness: 200,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 2,
      reduceMotion: ReduceMotion.System
    }),
    opacity: withTiming(expanded.value ? 1 : 0, { duration: 200 })
  }))

  const shakeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeTranslateX.value }]
    }
  }, [])

  const shake = useCallback(() => {
    const amount = 6
    const timingConfig = {
      duration: 80,
      easing: Easing.bezier(0.35, 0.7, 0.5, 0.7)
    }
    shakeTranslateX.value = withSequence(
      withTiming(amount, timingConfig),
      withRepeat(withTiming(-amount, { duration: 200 }), 2, true),
      withSpring(0, { mass: 0.5 })
    )
  }, [])

  return (
    <Themed.View style={styles.container} type="secondary">
      <TouchableOpacity style={styles.row} activeOpacity={1} onPress={toggleExpand}>
        <Ionicons name={iconName as any} size={iconSize} color={colors.text} style={styles.icon} />

        <View style={{ flex: 1, gap: 2 }}>
          <Themed.Text style={styles.title}>{title}</Themed.Text>
          {subtitle && <Themed.Text style={styles.subtitle}>{subtitle}</Themed.Text>}
        </View>

        <AnimatedTouchableOpacity
          style={[styles.addButton, shakeStyle, { backgroundColor: hideButton ? 'transparent' : '#007BFF' }]}
          onPress={onAddPress ? onAddPress : toggleExpand}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isEdit ? 'pencil' : isUpload ? 'cloud-upload-outline' : 'add'}
            size={isEdit ? 18 : 24}
            color={hideButton ? 'transparent' : 'white'}
          />
        </AnimatedTouchableOpacity>
      </TouchableOpacity>

      {children && (
        <Animated.View
          style={[
            rChildrenContainerStyle,
            {
              alignSelf: 'center',
              overflow: 'hidden',
              borderTopWidth: expanded,
              borderTopColor: colors.borderColor,
              width: '90%'
            }
          ]}
        >
          <View
            onLayout={(e) => setChildrenHeight(e.nativeEvent.layout.height)}
            style={{ position: 'absolute', paddingTop: 12, width: '100%' }}
          >
            {children}
          </View>
        </Animated.View>
      )}
    </Themed.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',

    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
    gap: 4
  },
  icon: {
    marginRight: 12
  },
  title: {
    fontSize: 18,
    fontWeight: '500'
  },
  subtitle: {
    fontSize: 14,
    color: 'grey'
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  divider: {
    height: 1,
    backgroundColor: 'black',
    marginHorizontal: 16
  }
})

export default ExpandableRow
