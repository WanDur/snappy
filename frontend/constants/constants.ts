import { Platform, Dimensions } from 'react-native'
import { getLocales } from 'expo-localization'

const screen = Dimensions.get('screen')

const Constants = {
  isIOS: Platform.OS === 'ios',
  isPhone: Platform.OS === 'android' || Platform.OS === 'ios',
  screenWidth: screen.width,
  screenHeight: screen.height,
  deviceLng: getLocales()[0].languageTag ?? ''
}

export default Constants
