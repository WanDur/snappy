import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import 'react-native-reanimated'

import { useTheme, useUserStore } from '@/hooks'
import { SettingsProvider } from '@/contexts'
import { useColorScheme } from '@/hooks/useColorScheme'
import { Stack } from '@/components/router-form'
import { bypassLogin, SessionProvider } from '@/contexts/auth'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { setUser } = useUserStore()
  const colorScheme = useColorScheme()
  const { colors } = useTheme()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf')
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
      if (bypassLogin()) {
        setUser({
          id: '1y2318273091720312',
          name: 'Alex Johnson',
          username: '@alexjphoto',
          email: '@mail',
          phone: '1234567890',
          notificationTokens: [],
          tier: {},
          bio: '',
          iconUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
          premiumExpireTime: undefined
        })
        console.log('User set in _layout.tsx')
      }
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

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
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />

                <Stack.Screen name="(auth)/signup" options={{ presentation: 'modal', headerShown: false }} />

                <Stack.Screen name="(modal)/CreateAlbumModal" sheet />
                <Stack.Screen name="(modal)/ChatSettingModal" sheet />
                <Stack.Screen
                  name="(modal)/ViewImageModal"
                  options={{ headerShown: false, gestureEnabled: false }}
                  sheet
                />
                <Stack.Screen name="(modal)/FriendProfileModal" sheet />
                <Stack.Screen name="(modal)/RedeemCodeModal" options={{ headerShown: false }} sheet />
                <Stack.Screen name="(modal)/AddFriendToGroupModal" options={{ gestureEnabled: false }} sheet />
                <Stack.Screen
                  name="(modal)/PremiumInfoModal"
                  options={{ presentation: 'transparentModal', headerShown: false }}
                />
                <Stack.Screen
                  name="(modal)/ProfileAvatar"
                  options={{
                    presentation: 'transparentModal',
                    headerShown: false,
                    animation: 'fade',
                    animationDuration: 300
                  }}
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
