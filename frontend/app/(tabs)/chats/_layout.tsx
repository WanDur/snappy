import { Stack } from '@/components/router-form'

const Layout = () => {
  return (
    <Stack screenOptions={{ title: 'Chats' }}>
      <Stack.Screen name="index-chats" largeTitle />
    </Stack>
  )
}
export default Layout
