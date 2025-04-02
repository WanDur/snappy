import { Stack } from '@/components/router-form'

const Layout = () => {
  return (
    <Stack screenOptions={{ title: 'Profile' }}>
      <Stack.Screen name="index-profile" largeTitle />
      <Stack.Screen name="ProfileDetailScreen" options={{ headerTitle: 'Edit profile' }} largeTitle />
      <Stack.Screen name="AccountDetailScreen" options={{ headerTitle: 'Account' }} largeTitle />
      <Stack.Screen
        name="EditProfileScreen"
        options={{
          presentation: 'formSheet',
          title: '',
          headerShown: false,
          sheetExpandsWhenScrolledToEdge: false,
          sheetCornerRadius: 16
        }}
        largeTitle
      />
    </Stack>
  )
}
export default Layout
