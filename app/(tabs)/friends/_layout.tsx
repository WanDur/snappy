import { Stack } from 'expo-router'
import { Constants } from '@/constants'

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerTitle: 'Friends',
        ...Constants.stackLargeTitleProps
      }}
    >
      <Stack.Screen name="index-friends" />
    </Stack>
  )
}
export default Layout
