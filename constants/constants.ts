import { Platform, Dimensions, StyleProp } from 'react-native'
import { getLocales } from 'expo-localization'
import { BlurEffectTypes } from 'react-native-screens'

const screen = Dimensions.get('screen')

const Constants = {
  isIOS: Platform.OS === 'ios',
  isPhone: Platform.OS === 'android' || Platform.OS === 'ios',
  screenWidth: screen.width,
  screenHeight: screen.height,
  deviceLng: getLocales()[0].languageTag ?? '',
  // common options for header large title in ios
  stackLargeTitleProps:
    Platform.OS === 'ios'
      ? {
          headerLargeTitle: true,
          headerTransparent: true,
          headerBlurEffect: 'systemChromeMaterial' as BlurEffectTypes,
          headerLargeTitleShadowVisible: false,
          headerShadowVisible: true,
          headerLargeStyle: {
            backgroundColor: 'transparent'
          } as StyleProp<{ backgroundColor?: string }>
        }
      : {},
  // common options for header shadow in ios
  stackHeaderShadowProps:
    Platform.OS === 'ios'
      ? {
          headerTransparent: true,
          headerBlurEffect: 'systemChromeMaterial' as BlurEffectTypes,
          headerLargeTitleShadowVisible: false,
          headerShadowVisible: true,
          headerBackTitle: 'Back'
        }
      : {
          headerTransparent: true,
          headerShadowVisible: true,
          headerBackTitle: 'Back'
        }
}

export default Constants
