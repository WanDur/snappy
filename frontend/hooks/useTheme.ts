import { useColorScheme } from 'react-native'

import { Colors } from '@/constants'

export const useTheme = () => {
  const theme: 'light' | 'dark' = useColorScheme() === 'dark' ? 'dark' : 'light'
  const reverseTheme: 'light' | 'dark' = theme === 'dark' ? 'light' : 'dark'
  const colors = theme === 'dark' ? Colors.dark : Colors.light
  const isDark = theme === 'dark'

  return { theme, reverseTheme, colors, isDark }
}
