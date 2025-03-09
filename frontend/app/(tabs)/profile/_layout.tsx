import { Stack } from 'expo-router'
import { Constants } from '@/constants'

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        title: 'Profile',
        ...Constants.stackLargeTitleProps
      }}
    >
      <Stack.Screen name="index-profile" />
      <Stack.Screen name="ProfileDetailScreen" options={{ headerTitle: 'Edit profile' }} />
      <Stack.Screen name="AccountDetailScreen" options={{ headerTitle: 'Account' }} />
      <Stack.Screen
        name="EditProfileScreen"
        options={{
          presentation: 'formSheet',
          title: '',
          headerShown: false,
          sheetExpandsWhenScrolledToEdge: false,
          sheetCornerRadius: 16
        }}
      />
    </Stack>
  )
}
export default Layout
