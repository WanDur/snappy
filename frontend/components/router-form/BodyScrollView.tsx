'use client'

import useMergedRef from '@/hooks/useMergedRef'
import { useScrollToTop } from '@/hooks/useTabToTop'
import * as AC from '@bacons/apple-colors'
import { forwardRef, useRef } from 'react'
import { ScrollViewProps } from 'react-native'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useBottomTabOverflow } from '../ui/TabBarBackground'

export const BodyScrollView = forwardRef<any, ScrollViewProps>((props, ref) => {
  const paddingBottom = useBottomTabOverflow()
  const scrollRef = useRef(null)

  const statusBarInset = useSafeAreaInsets().top // inset of the status bar

  const largeHeaderInset = statusBarInset + 92 // inset to use for a large header since it's frame is equal to 96 + the frame of status bar

  useScrollToTop(scrollRef, -largeHeaderInset)
  // @ts-ignore
  const merged = useMergedRef(scrollRef, ref)

  return (
    <Animated.ScrollView
      scrollToOverflowEnabled
      automaticallyAdjustsScrollIndicatorInsets
      contentInsetAdjustmentBehavior="automatic"
      contentInset={{
        bottom: paddingBottom,
        top: process.env.EXPO_OS === 'web' ? 60 : undefined
      }}
      scrollIndicatorInsets={{ bottom: paddingBottom }}
      {...props}
      // style={[{ backgroundColor: AC.systemGroupedBackground }, props.style]}
      style={[props.style]}
      ref={merged}
    />
  )
})

if (__DEV__) {
  BodyScrollView.displayName = 'BodyScrollView'
}
