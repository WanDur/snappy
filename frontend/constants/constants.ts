import { Platform, Dimensions } from 'react-native'

const screen = Dimensions.get('screen')

const Constants = {
  isIOS: Platform.OS === 'ios',
  isPhone: Platform.OS === 'android' || Platform.OS === 'ios',
  screenWidth: screen.width,
  screenHeight: screen.height
}

export default Constants
