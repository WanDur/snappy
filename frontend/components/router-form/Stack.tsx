import React from 'react'
import { NativeStackNavigationOptions } from '@react-navigation/native-stack'
import { Stack as NativeStack } from 'expo-router'

// These are the default stack options for iOS, they disable on other platforms.
export const STACK_LARGE_HEADER: NativeStackNavigationOptions =
  process.env.EXPO_OS !== 'ios'
    ? {}
    : {
        headerTransparent: true,
        headerBlurEffect: 'systemChromeMaterial',
        headerShadowVisible: true,
        headerLargeTitleShadowVisible: false,
        headerLargeStyle: {
          backgroundColor: 'transparent'
        },
        headerLargeTitle: true
      }

// keep the ios native shadow property, but remove the large title
const DEFAULT_STACK_HEADER: NativeStackNavigationOptions =
  process.env.EXPO_OS !== 'ios'
    ? { headerShadowVisible: true, headerBackTitle: 'Back' }
    : {
        headerTransparent: true,
        headerBlurEffect: 'systemChromeMaterial',
        headerLargeTitleShadowVisible: false,
        headerShadowVisible: true,
        headerBackTitle: 'Back'
      }

/** Create a bottom sheet on iOS with extra snap points (`sheetAllowedDetents`) */
export const BOTTOM_SHEET: NativeStackNavigationOptions = {
  // https://github.com/software-mansion/react-native-screens/blob/main/native-stack/README.md#sheetalloweddetents
  presentation: 'formSheet',
  gestureDirection: 'vertical',
  animation: 'slide_from_bottom',
  sheetGrabberVisible: true
}

export default function Stack({ screenOptions, children, ...props }: React.ComponentProps<typeof NativeStack>) {
  const processedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const { sheet, largeTitle, ...props } = child.props
      if (sheet) {
        return React.cloneElement(child, {
          ...props,
          options: {
            ...BOTTOM_SHEET,
            ...props.options
          }
        })
      }
      if (largeTitle) {
        return React.cloneElement(child, {
          ...props,
          options: {
            ...STACK_LARGE_HEADER,
            ...props.options
          }
        })
      }
    }
    return child
  })

  return (
    <NativeStack
      screenOptions={{
        ...DEFAULT_STACK_HEADER,
        ...screenOptions
      }}
      {...props}
      children={processedChildren}
    />
  )
}

Stack.Screen = NativeStack.Screen as React.FC<
  React.ComponentProps<typeof NativeStack.Screen> & {
    /** Make the sheet open as a bottom sheet with default options on iOS. */
    sheet?: boolean
    /** Enable large title on iOS. */
    largeTitle?: boolean
  }
>
