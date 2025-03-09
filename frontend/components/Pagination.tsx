/**
 * Pagination component for carousel
 */
import { View, Pressable, PressableProps, ViewStyle } from 'react-native'
import Animated, {
  AnimatedProps,
  FadeInDown,
  FadeInLeft,
  FadeOutLeft,
  FadeOutUp,
  interpolateColor,
  LinearTransition,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring
} from 'react-native-reanimated'
import { ICarouselInstance } from 'react-native-reanimated-carousel'

import { useTheme } from '@/hooks'
import Themed from './themed/Themed'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)
const _layoutTransition = LinearTransition.springify().damping(80).stiffness(200)
const _dotContainer = 24
const _dotSize = 8

interface PaginationProps {
  /**
   * Reference to carousel instance, used to navigate to next or previous slide
   */
  caroselRef: React.RefObject<ICarouselInstance>

  /**
   * Total number of slides
   */
  total: number

  /**
   * Current selected index
   */
  selectedIndex: number

  /**
   * Callback when index changes
   */
  onIndexChange: (index: number) => void

  /**
   * Disable the proceed button
   */
  disableButton?: boolean

  /**
   * Call back when the last button is pressed
   */
  finishButtonPress?: () => void

  /**
   * Style for pagination indicator, you can change its color here
   * @default backgroundColor: '#036bfb'
   */
  indicatorStyle?: ViewStyle

  /**
   * Customize the color of the dots, for both active and inactive
   * @default active: '#fff', inactive: '#ddd'
   */
  dotColor?: { active: string; inactive: string }

  /**
   * Customize all the button labels
   * @default next: 'Next', back: 'Back', finish: 'Finish'
   */
  buttonLabel?: { next?: string; back?: string; finish?: string }
}

const AnimatedButton = ({ children, style, ...rest }: AnimatedProps<PressableProps>) => {
  return (
    <AnimatedPressable
      style={[
        style,
        { height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 }
      ]}
      entering={FadeInLeft.springify().damping(80).stiffness(200)}
      exiting={FadeOutLeft.springify().damping(80).stiffness(200)}
      layout={_layoutTransition}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  )
}

const Dot = ({
  index,
  animation,
  color
}: {
  index: number
  animation: SharedValue<number>
  color: { active: string; inactive: string }
}) => {
  const dotStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        animation.value,
        [index - 1, index, index + 1],
        [color.inactive, color.active, color.active]
      )
    }
  })

  return (
    <View style={{ width: _dotContainer, height: _dotContainer, justifyContent: 'center', alignItems: 'center' }}>
      <Animated.View style={[dotStyle, { width: _dotSize, height: _dotSize, borderRadius: _dotSize }]} />
    </View>
  )
}

const PaginationDots = ({
  selectedIndex,
  total,
  indicatorStyle,
  dotColor = { active: '#fff', inactive: '#ddd' }
}: {
  selectedIndex: number
  total: number
  indicatorStyle?: ViewStyle
  dotColor?: { active: string; inactive: string }
}) => {
  const animation = useDerivedValue(() => {
    return withSpring(selectedIndex, { damping: 80, stiffness: 200 })
  })

  const style = useAnimatedStyle(() => {
    return {
      width: _dotContainer + _dotContainer * animation.value
    }
  })

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ flexDirection: 'row' }}>
        {/* Pagination indicator */}
        <Animated.View
          style={[
            style,
            {
              backgroundColor: '#036bfb',
              height: _dotContainer,
              width: _dotContainer,
              borderRadius: _dotContainer,
              position: 'absolute',
              left: 0,
              right: 0
            },
            indicatorStyle
          ]}
        />
        {/* Pagination dots */}
        {[...Array(total).keys()].map((i) => (
          <Dot key={`dot-${i}`} index={i} animation={animation} color={dotColor} />
        ))}
      </View>
    </View>
  )
}

const Pagination = ({
  caroselRef,
  total,
  selectedIndex,
  onIndexChange,
  disableButton,
  finishButtonPress,
  indicatorStyle,
  dotColor,
  buttonLabel
}: PaginationProps) => {
  const { colors } = useTheme()

  return (
    <View style={{ marginBottom: 80, width: '100%', padding: 8, gap: 8 }}>
      <PaginationDots selectedIndex={selectedIndex} total={total} indicatorStyle={indicatorStyle} dotColor={dotColor} />
      <View style={{ flexDirection: 'row', gap: 16, marginHorizontal: 16, marginTop: 10 }}>
        {selectedIndex > 0 && (
          <AnimatedButton
            style={{ backgroundColor: colors.secondaryBg }}
            onPress={() => {
              onIndexChange(selectedIndex - 1)
              caroselRef?.current?.prev()
            }}
          >
            <Themed.Text style={{ fontWeight: '600' }}>{buttonLabel?.back || 'Back'}</Themed.Text>
          </AnimatedButton>
        )}
        <AnimatedButton
          style={{ backgroundColor: disableButton ? '#8c8c8c' : '#036bfb', flex: 1 }}
          onPress={() => {
            if (selectedIndex === total - 1) {
              finishButtonPress?.()
              return
            }
            onIndexChange(selectedIndex + 1)
            caroselRef?.current?.next()
          }}
          disabled={disableButton}
        >
          {selectedIndex === total - 1 ? (
            <Animated.Text
              key="finish"
              style={{ color: 'white', fontWeight: '600' }}
              entering={FadeInDown.springify().damping(80).stiffness(200)}
              exiting={FadeOutUp.springify().damping(80).stiffness(200)}
            >
              {buttonLabel?.finish || 'Finish'}
            </Animated.Text>
          ) : (
            <Animated.Text
              key="next"
              style={{ color: 'white', fontWeight: '600' }}
              entering={FadeInDown.springify().damping(80).stiffness(200)}
              exiting={FadeOutUp.springify().damping(80).stiffness(200)}
              layout={_layoutTransition}
            >
              {buttonLabel?.next || 'Next'}
            </Animated.Text>
          )}
        </AnimatedButton>
      </View>
    </View>
  )
}

export default Pagination
