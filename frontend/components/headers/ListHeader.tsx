import { StyleSheet, View, TouchableOpacity, ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  withSequence,
  SharedValue,
  Easing
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'

import { useTheme } from '@/hooks'
import Themed from '../themed/Themed'

interface AccordionItemProps {
  isExpanded: SharedValue<boolean>
  children: React.ReactNode
  viewKey: string
  style?: ViewStyle
  duration?: number
}

interface ListHeaderProps {
  title: string
  children: React.ReactNode
  titleLeftComponent?: React.ReactNode
  titleRightComponent?: React.ReactNode
  onPress?: () => void
}

const AccordionItem = ({ isExpanded, children, viewKey, style, duration = 350 }: AccordionItemProps) => {
  const height = useSharedValue(0)

  const derivedHeight = useDerivedValue(() => withTiming(height.value * Number(isExpanded.value), { duration }))
  const bodyStyle = useAnimatedStyle(() => ({
    height: derivedHeight.value
  }))

  return (
    <Animated.View key={`accordionItem_${viewKey}`} style={[styles.animatedView, bodyStyle, style]}>
      <View
        onLayout={(e) => {
          height.value = e.nativeEvent.layout.height
        }}
        style={styles.wrapper}
      >
        {children}
      </View>
    </Animated.View>
  )
}

const ListHeader = ({ title, titleLeftComponent, titleRightComponent, children, onPress }: ListHeaderProps) => {
  const { colors } = useTheme()
  const isExpanded = useSharedValue(false)

  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
  }

  const rotation = useDerivedValue(() =>
    isExpanded.value
      ? withSequence(
          withTiming(100, { duration: 200, easing: Easing.out(Easing.ease) }),
          withTiming(90, { duration: 150, easing: Easing.out(Easing.ease) })
        )
      : withSequence(
          withTiming(10, { duration: 200, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 150, easing: Easing.out(Easing.ease) })
        )
  )
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }]
  }))

  const handlePress = () => {
    toggleExpand()
    onPress && onPress()
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.sectionHeader} onPress={handlePress} activeOpacity={0.8}>
        {titleLeftComponent ? (
          titleLeftComponent
        ) : (
          <Animated.View style={[iconStyle, { marginRight: 2 }]}>
            <Ionicons name="chevron-forward" size={22} color={colors.text} />
          </Animated.View>
        )}

        <Themed.Text style={styles.sectionHeaderText}>{title}</Themed.Text>
        {titleRightComponent && titleRightComponent}
      </TouchableOpacity>

      <AccordionItem isExpanded={isExpanded} viewKey="Accordion">
        {children}
      </AccordionItem>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 10
  },
  sectionHeaderText: {
    fontSize: 22,
    fontWeight: '600'
  },
  animatedView: {
    width: '100%',
    overflow: 'hidden'
  },
  wrapper: {
    width: '100%',
    position: 'absolute'
  }
})

export default ListHeader
