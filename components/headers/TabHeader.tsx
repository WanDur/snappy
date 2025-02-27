/**
 * this component is used for rendering the top header in the tabs
 * multiple buttons can be added to the header, see HeaderIconData
 */
import React, { type ReactNode } from 'react'
import { StyleSheet, type ViewStyle } from 'react-native'
import { Tabs } from 'expo-router'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { ThemedText } from '../themed/ThemedText'
import { ThemedView } from '../themed/ThemedView'
import { Constants } from '@/constants'
import ScreenHeaderBtn from './ScreenHeaderBtn'

interface HeaderIconData {
  iconName?: string
  handlePress: () => void
  headerName?: string
  color?: string
}

interface TabHeaderProps {
  /**
   * title of the tab, which is located at the top left of the screen
   */
  headerTitle: string

  children: ReactNode

  /**
   * data for each icon in the header
   * if you want to add multiple icons, pass an array of HeaderIconData
   */
  data?: HeaderIconData[] | HeaderIconData

  /**
   * showing an extra icon such as a profile picture at the top right of the setting screen
   * it uses MaterialIcons, so make sure to pass the correct name
   */
  extraIcon?: any

  /**
   * whether the screen is scrollable
   */
  scrollable?: boolean

  containerStyle?: ViewStyle
}

interface SpacerProps {
  width: number
}

const Spacer = ({ width }: SpacerProps) => {
  return <ThemedView style={{ width }} />
}

const TabHeader = ({
  headerTitle,
  children,
  data = [],
  extraIcon,
  scrollable = true,
  containerStyle
}: TabHeaderProps) => {
  return (
    <ThemedView style={[styles.container, containerStyle]}>
      <Tabs.Screen
        options={{
          headerTitle: '',
          headerShadowVisible: false,
          headerRightContainerStyle: { paddingTop: 26, paddingRight: 6 }
        }}
      />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        scrollEnabled={scrollable}
        keyboardDismissMode="on-drag"
      >
        <ThemedView style={[styles.h1TextContainer, { marginTop: -5 }]}>
          <ThemedText style={styles.h1Text}>{headerTitle}</ThemedText>
          <ThemedView style={{ flexDirection: 'row', marginTop: 2 }}>
            {(Array.isArray(data) ? data : [data]).map((item, index, array) => (
              <React.Fragment key={index}>
                <ScreenHeaderBtn
                  iconName={item.iconName}
                  headerName={item.headerName}
                  handlePress={item.handlePress}
                  extraIcon={extraIcon}
                  color={item.color}
                />
                {/* add spacing between each icon or component in the header */}
                {index !== array.length - 1 && <Spacer width={8} />}
              </React.Fragment>
            ))}
          </ThemedView>
        </ThemedView>

        {children}
      </KeyboardAwareScrollView>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.screenHeight * 0.08
  },
  h1Text: {
    fontWeight: '800',
    fontSize: 32,
    marginTop: 2
  },
  h1TextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    fontSize: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 3
  }
})

export default TabHeader
