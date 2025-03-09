import { Stack } from 'expo-router'
import { Constants } from '@/constants'

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerTitle: 'Home',
        ...Constants.stackLargeTitleProps
      }}
    >
      <Stack.Screen name="index-home" />
    </Stack>
  )
}
export default Layout
