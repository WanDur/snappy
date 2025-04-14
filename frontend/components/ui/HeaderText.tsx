import { TouchableOpacity, ViewStyle } from 'react-native'

import { ThemedTextProps } from '../themed/ThemedText'
import Themed from '../themed/Themed'

interface Props {
  /**
   * text to be rendered
   */
  text?: string
  /**
   * children to be rendered inside the component
   * if children is provided, text and textProps will be ignored
   */
  children?: React.ReactNode
  /**
   * text props to be passed to Themed.Text component
   */
  textProps?: ThemedTextProps
  /**
   * onPress function
   */
  onPress?: () => void
  /**
   * style for the text container
   */
  style?: ViewStyle
}

const HeaderText = ({ text, textProps, onPress, children, style }: Props) => {
  if (!text && !children) {
    console.error('HeaderText: text or children prop is required')
  }

  const _onPress = (() => {
    if (textProps) {
      if (Object.keys(textProps).includes('state')) {
        return textProps.state!.valueOf() ? onPress : () => {}
      }
    }
    return onPress
  })()

  if (children) {
    return (
      <TouchableOpacity style={[style, { padding: 2 }]} onPress={_onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    )
  }
  return (
    <TouchableOpacity style={[style, { padding: 2 }]} onPress={_onPress} activeOpacity={0.7}>
      <Themed.Text type="headerButton" {...textProps}>
        {text}
      </Themed.Text>
    </TouchableOpacity>
  )
}

export default HeaderText
