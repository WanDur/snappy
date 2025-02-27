import React from 'react'
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import { AntDesign, FontAwesome } from '@expo/vector-icons'
import Animated, { FadeIn, FadeOut, LinearTransition, useAnimatedStyle, withTiming } from 'react-native-reanimated'

import { useTheme } from '@/hooks'
import { Colors } from '@/constants'

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

export interface FilterSortButtonProps {
  name: string
  /** Whether this button is currently selected */
  selected: boolean
  /**
   * If the button supports sorting (i.e. toggling between ascending and descending),
   * this prop indicates the current sort order. It can be 'up' (ascending) or 'down' (descending).
   * For non-sortable buttons, leave this undefined.
   */
  sortDirection?: 'up' | 'down'
  /**
   * Set to true if the button supports toggling a sort direction.
   * For example, "salary" and "views" can be sorted, but "recommended" is static.
   */
  isSortable?: boolean
  /**
   * Called when the button is pressed.
   * For sortable buttons:
   * - If not selected, call with 'up' as the default sort direction.
   * - If already selected, the sort direction will be toggled and passed as an argument.
   * For non-sortable buttons, the argument will be undefined.
   */
  onPress: (newSortDirection?: 'up' | 'down') => void
  style?: ViewStyle
}

const FilterSortButton = ({
  name,
  selected,
  sortDirection,
  isSortable = false,
  onPress,
  style
}: FilterSortButtonProps) => {
  const { theme } = useTheme()

  const rContainerStyle = useAnimatedStyle(
    () => ({
      backgroundColor: withTiming(selected ? '#FF6347' + '44' : 'transparent', { duration: 100 }),
      borderColor: withTiming(selected ? 'tomato' : Colors[theme].borderColor, { duration: 100 })
    }),
    [selected]
  )

  const tTextStyle = useAnimatedStyle(
    () => ({
      color: withTiming(selected ? 'red' : Colors[theme].text, { duration: 100 })
    }),
    [selected]
  )

  const handlePress = () => {
    if (!selected) {
      // If not selected, select the button.
      // For sortable buttons, default to 'up' when first selected.
      onPress(isSortable ? 'up' : undefined)
    } else if (selected && isSortable) {
      // If already selected and sortable, toggle the sort direction.
      const newDirection = sortDirection === 'up' ? 'down' : 'up'
      onPress(newDirection)
    } else {
      // If selected but not sortable, clicking again has no effect.
      onPress()
    }
  }

  return (
    <AnimatedTouchableOpacity
      style={[styles.container, style, rContainerStyle]}
      onPress={handlePress}
      layout={LinearTransition.springify().mass(0.2)}
      activeOpacity={1}
    >
      <Animated.Text style={[styles.label, tTextStyle]}>{name}</Animated.Text>
      {selected && isSortable && (
        <Animated.View style={styles.icon} entering={FadeIn.duration(300)} exiting={FadeOut}>
          <FontAwesome name={sortDirection === 'up' ? 'arrow-up' : 'arrow-down'} size={14} color={'tomato'} />
        </Animated.View>
      )}
      {selected && !isSortable && (
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
    width: 14,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default FilterSortButton
