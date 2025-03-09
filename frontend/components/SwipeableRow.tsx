import React, { useRef } from 'react'
import { StyleSheet, Alert } from 'react-native'
import ReanimatedSwipeable, { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable'
import Animated, {
  SharedValue,
  useAnimatedReaction,
  useSharedValue,
  runOnJS,
  useAnimatedStyle,
  configureReanimatedLogger
} from 'react-native-reanimated'
import Ionicons from '@expo/vector-icons/Ionicons'
import * as Haptics from 'expo-haptics'

interface SwipeableRowProps {
  children: React.ReactNode
  id: string
  title: string
  onDelete?: () => void
}

configureReanimatedLogger({
  strict: false // Reanimated runs in strict mode by default
})

const RightAction = (prog: SharedValue<number>, drag: SharedValue<number>) => {
  const hasReachedThresholdUp = useSharedValue(false)
  const hasReachedThresholdDown = useSharedValue(false)

  useAnimatedReaction(
    () => {
      return drag.value
    },
    (dragValue) => {
      if (Math.abs(dragValue) > 100 && !hasReachedThresholdUp.value) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium)
        hasReachedThresholdUp.value = true
        hasReachedThresholdDown.value = false
      } else if (Math.abs(dragValue) < 100 && !hasReachedThresholdDown.value && hasReachedThresholdUp.value) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium)
        hasReachedThresholdDown.value = true
        hasReachedThresholdUp.value = false
      }
    }
  )

  const animatedStyle = useAnimatedStyle(() => {
    if (Math.abs(drag.value) > 100) {
      return {
        backgroundColor: '#d11a2a'
      }
    }
    return {
      backgroundColor: '#8b8a8a'
    }
  })

  return (
    <Animated.View style={[{ flex: 1 }]}>
      <Animated.View style={[styles.rightAction, animatedStyle]}>
        <Ionicons name="trash-outline" size={26} color="#fff" />
      </Animated.View>
    </Animated.View>
  )
}

const SwipeableRow = ({ children, id, title, onDelete }: SwipeableRowProps) => {
  const reanimatedRef = useRef<SwipeableMethods>(null)

  const deleteChat = async () => {
    onDelete && onDelete()
    reanimatedRef.current?.reset()
  }

  const onSwipeableOpen = () => {
    Alert.alert(`${title}`, 'Are you sure to delete this chat? This action cannot be undone.', [
      { text: 'Cancel', onPress: () => reanimatedRef.current?.close(), style: 'cancel' },
      { text: 'Delete', onPress: deleteChat, style: 'destructive' }
    ])
  }

  return (
    <ReanimatedSwipeable
      ref={reanimatedRef}
      friction={2}
      rightThreshold={40}
      renderRightActions={RightAction}
      onSwipeableWillOpen={onSwipeableOpen}
    >
      {children}
    </ReanimatedSwipeable>
  )
}

const styles = StyleSheet.create({
  rightAction: {
    height: 90,
    backgroundColor: '#8b8a8a',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    flex: 1
  }
})

export default SwipeableRow
