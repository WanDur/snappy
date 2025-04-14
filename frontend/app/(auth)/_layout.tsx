import { Stack } from '@/components/router-form'

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="SignUpScreen" options={{ presentation: 'modal' }} />
    </Stack>
  )
}
