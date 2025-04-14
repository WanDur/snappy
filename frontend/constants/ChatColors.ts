import { ViewStyle, TextStyle } from 'react-native'

interface SideStyles {
  left: TextStyle & ViewStyle
  right: TextStyle & ViewStyle
}
type ChatColorItem = Record<string, SideStyles>
type ChatColors = Record<'light' | 'dark', ChatColorItem>

export const ChatColors: ChatColors = {
  light: {
    wrapper: {
      left: {
        backgroundColor: '#E8E8EA'
      },
      right: {
        backgroundColor: '#309FFD'
      }
    },
    text: {
      left: {
        color: '#11181C'
      },
      right: {
        color: '#f4f4f4'
      }
    },
    file: {
      left: {
        backgroundColor: '#B5B5B5',
        color: '#111111'
      },
      right: {
        backgroundColor: '#3067fd',
        color: '#EEEEEE'
      }
    }
  },
  dark: {
    wrapper: {
      left: {
        backgroundColor: '#262629'
      },
      right: {
        backgroundColor: '#309FFD'
      }
    },
    text: {
      left: {
        color: '#F4F4F4'
      },
      right: {
        color: '#F4F4F4'
      }
    },
    file: {
      left: {
        backgroundColor: '#68686e',
        color: '#F4F4F4'
      },
      right: {
        backgroundColor: '#228ae3',
        color: '#EEEEEE'
      }
    }
  }
}
