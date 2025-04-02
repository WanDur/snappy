import { Stack } from '@/components/router-form'

const Layout = () => {
  return (
    <Stack screenOptions={{ title: 'Friends' }}>
      <Stack.Screen name="index-friends" largeTitle />
    </Stack>
  )
}
export default Layout
