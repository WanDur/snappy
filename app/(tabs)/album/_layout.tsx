import { Stack } from 'expo-router'
import { Constants } from '@/constants'

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerTitle: 'Albums',
        ...Constants.stackLargeTitleProps
      }}
    >
      <Stack.Screen name="index-album" />
    </Stack>
  )
}
export default Layout
