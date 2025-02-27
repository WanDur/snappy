import React, { useState, useEffect } from 'react'
import {
  Text,
  Animated,
  StyleProp,
  ViewStyle,
  Dimensions,
  TouchableOpacity,
  TextStyle,
  I18nManager,
  useColorScheme,
  StyleSheet
} from 'react-native'

const { width: ScreenWidth } = Dimensions.get('window')

// Colors defined for both light and dark mode
const Colors = {
  light: {
    text: '#11181C',
    background: '#F3F5F6',
    activeTab: '#fff',
    shadowColor: '#000',
    tabText: '#000'
  },
  dark: {
    text: '#ECEDEE',
    background: '#121212',
    activeTab: '#333',
    shadowColor: '#fff',
    tabText: '#fff'
  }
}

export type CustomStyleProp = StyleProp<ViewStyle> | Array<StyleProp<ViewStyle>>
type CustomTextStyleProp = StyleProp<TextStyle> | Array<StyleProp<TextStyle>>

interface SegmentedControlProps {
  tabs: any[]
  width?: number
  initialIndex?: number
  activeTextColor?: string
  activeTabColor?: string
  extraSpacing?: number
  style?: CustomStyleProp
  tabStyle?: CustomStyleProp
  textStyle?: CustomTextStyleProp
  selectedTabStyle?: CustomStyleProp
  onChange: (index: number) => void
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  style,
  tabs,
  width,
  onChange,
  tabStyle,
  textStyle,
  selectedTabStyle,
  initialIndex = 0,
  activeTextColor,
  activeTabColor,
  extraSpacing = 0
}) => {
  const translateValue = (width ? width + extraSpacing : ScreenWidth - 35) / tabs.length
  const [slideAnimation] = useState(new Animated.Value(0))
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex)
  const theme = useColorScheme()
  const themeColors = Colors[theme || 'light']

  const handleTabPress = React.useCallback((index: number) => {
    setCurrentIndex(index)
    onChange && onChange(index)
  }, [])

  useEffect(() => {
    Animated.spring(slideAnimation, {
      toValue: (I18nManager.isRTL ? -1 : 1) * currentIndex * translateValue,
      stiffness: 300,
      damping: 25,
      mass: 1,
      useNativeDriver: true
    }).start()
  }, [currentIndex])

  const renderSelectedTab = () => (
    <Animated.View
      style={[
        _selectedTabStyle(tabs, activeTabColor || themeColors.activeTab, slideAnimation, width, themeColors),
        selectedTabStyle
      ]}
    />
  )

  const renderTab = (tab: any, index: number) => {
    const isActiveTab = currentIndex === index
    const isTabText = typeof tab === 'string'
    return (
      <TouchableOpacity
        key={index}
        activeOpacity={0.5}
        style={[styles.tab, tabStyle]}
        onPress={() => handleTabPress(index)}
      >
        {!isTabText ? (
          tab
        ) : (
          <Text
            numberOfLines={1}
            style={[
              { color: themeColors.tabText, ...styles.textStyle },
              textStyle,
              isActiveTab && { color: activeTextColor || themeColors.text }
            ]}
          >
            {tab}
          </Text>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <Animated.View style={[_containerStyle(width, themeColors), style]}>
      {renderSelectedTab()}
      {tabs.map((tab, index: number) => renderTab(tab, index))}
    </Animated.View>
  )
}

// Combined styles for container and selected tab
const _containerStyle = (width?: number, themeColors?: any): ViewStyle => ({
  width: width || ScreenWidth - 32,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: 8,
  backgroundColor: themeColors.background
})

const _selectedTabStyle = (
  tabs: any[],
  activeTabColor: string,
  translateXAnimation: any,
  width?: number,
  themeColors?: any
): CustomStyleProp => [
  {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    marginVertical: 2,
    marginHorizontal: 2,
    width: (width ? width - 8 : ScreenWidth - 35) / tabs?.length,
    backgroundColor: activeTabColor,
    shadowColor: themeColors.shadowColor,
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 2
    },
    elevation: 4,
    transform: [
      {
        translateX: translateXAnimation
      }
    ]
  }
]

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textStyle: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500'
  }
})

export default SegmentedControl
