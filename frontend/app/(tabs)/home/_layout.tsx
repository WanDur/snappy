import { Stack } from '@/components/router-form'

const Layout = () => {
  return (
    <Stack screenOptions={{ title: 'Home' }}>
      <Stack.Screen name="index-home" largeTitle />
    </Stack>
  )
}
export default Layout
