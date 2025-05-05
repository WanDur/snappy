import { Stack } from '@/components/router-form'

const Layout = () => {
  return (
    <Stack screenOptions={{ title: 'Profile' }}>
      <Stack.Screen name="index-profile" largeTitle />
    </Stack>
  )
}
export default Layout
