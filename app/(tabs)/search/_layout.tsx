import { Stack } from 'expo-router'
import { Constants } from '@/constants'

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        headerTitle: 'Search',
        ...Constants.stackLargeTitleProps
      }}
    >
      <Stack.Screen name="index-search" />
    </Stack>
  )
}
export default Layout
