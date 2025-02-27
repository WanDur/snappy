import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'

const Palette = {
  baseGray80: '#30302E',
  background: '#F1EEE8'
}

interface SegmentedControlProps {
  options: string[]
  selectedOption: string
  onOptionPress?: (option: string) => void
  selectedStyle?: 'line' | 'box'
}

const SegmentedControl: React.FC<SegmentedControlProps> = React.memo(
  ({ options, selectedOption, onOptionPress, selectedStyle = 'box' }) => {
    const { width: windowWidth } = useWindowDimensions()

    const internalPadding = 20
    const segmentedControlWidth = windowWidth - 30

    const itemWidth = (segmentedControlWidth - internalPadding) / options.length

    const rStyle = useAnimatedStyle(() => {
      return {
        left: withTiming(itemWidth * options.indexOf(selectedOption) + internalPadding / 2)
      }
    }, [selectedOption, options, itemWidth])

    return (
      <View
        style={[
          styles.container,
          {
            width: segmentedControlWidth,
            paddingLeft: internalPadding / 2
          },
          { backgroundColor: selectedStyle === 'box' ? '#E5E2DC' : 'transparent' }
        ]}
      >
        <Animated.View
          style={[
            {
              width: itemWidth
            },
            rStyle,
            selectedStyle === 'box' ? styles.activeBox : styles.activeLine
          ]}
        />
        {options.map((option) => {
          return (
            <TouchableOpacity
              onPress={() => {
                onOptionPress?.(option)
              }}
              key={option}
              style={[
                {
                  width: itemWidth
                },
                styles.labelContainer
              ]}
              activeOpacity={0.6}
            >
              <Text style={styles.label}>{option}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 50,
    borderRadius: 14
  },
  activeLine: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: Palette.baseGray80
  },
  activeBox: {
    position: 'absolute',
    borderRadius: 10,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0
    },
    shadowOpacity: 0.1,
    elevation: 3,
    height: '80%',
    top: '10%',
    backgroundColor: Palette.background
  },
  labelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: '#D3D3D3'
  },
  label: {
    fontSize: 16,
    fontWeight: '600'
  }
})

export { SegmentedControl }
