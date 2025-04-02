import { Stack } from '@/components/router-form'
import { STACK_LARGE_HEADER } from '@/components/router-form/Stack'

const Layout = () => {
  return (
    <Stack screenOptions={STACK_LARGE_HEADER}>
      <Stack.Screen name="DevScreen" options={{ headerLargeTitle: false }} />
      <Stack.Screen name="Dev_localstorage" options={{ headerLargeTitle: false }} />
      <Stack.Screen name="ZustandDevScreen" options={{ headerLargeTitle: false }} />
    </Stack>
  )
}

export default Layout
