import { Stack } from 'expo-router'
import { Constants } from '@/constants'

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        ...Constants.stackLargeTitleProps
      }}
    >
      <Stack.Screen name="index-chats" />
    </Stack>
  )
}
export default Layout
