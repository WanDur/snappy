import { Stack } from '@/components/router-form'

const Layout = () => {
  return (
    <Stack screenOptions={{ title: 'Albums' }}>
      <Stack.Screen name="index-album" largeTitle />
    </Stack>
  )
}
export default Layout
