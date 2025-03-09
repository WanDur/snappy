import { Stack } from 'expo-router'
import { Constants } from '@/constants'

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        ...Constants.stackLargeTitleProps
      }}
    >
      <Stack.Screen name="DevScreen" options={{ headerLargeTitle: false }} />
      <Stack.Screen name="Dev_localstorage" options={{ headerLargeTitle: false }} />
      <Stack.Screen name="ZustandDevScreen" options={{ headerLargeTitle: false }} />
    </Stack>
  )
}

export default Layout
