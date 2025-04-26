import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import 'react-native-reanimated'

import { useTheme } from '@/hooks'
import { SettingsProvider } from '@/contexts'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Stack } from '@/components/router-form'
import { initializeI18next } from '@/locales'
import { SessionProvider } from '@/contexts/auth'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const { colors } = useTheme()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  initializeI18next().then(() => {
    // console.info('i18next initialized - log from app/_layout.tsx')
  })

  return (
    <SessionProvider>
      <GestureHandlerRootView>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <SettingsProvider>
            <BottomSheetModalProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="settingscreen" options={{ presentation: 'containedModal', headerShown: false }} />
                <Stack.Screen name="+not-found" />

                <Stack.Screen name="(modal)/CreateAlbumModal" sheet />
                <Stack.Screen name="(modal)/ChatSettingModal" sheet />
                <Stack.Screen name="(modal)/ViewImageModal" options={{ headerShown: false }} sheet />
                <Stack.Screen name="(modal)/FriendProfileModal" sheet />
                <Stack.Screen
                  name="(modal)/PremiumInfoModal"
                  options={{ presentation: 'transparentModal', headerShown: false }}
                />
              </Stack>
            </BottomSheetModalProvider>
            <StatusBar backgroundColor={colors.background} animated />
          </SettingsProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SessionProvider>
  )
}
