import { View } from 'react-native'
import { useState } from 'react'
import { Stack, useRouter } from 'expo-router'
import validator from 'validator'

import { Themed, Bounceable } from '@/components'
import { HeaderText } from '@/components/ui'
import { useTheme } from '@/hooks'

const SignUpScreen = () => {
  const router = useRouter()
  const { colors } = useTheme()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const canNext =
    username.length >= 4 &&
    username.length <= 30 &&
    email.length > 0 &&
    validator.isEmail(email) &&
    password.length > 0 &&
    validator.isStrongPassword(password)

  const onNext = () => {
    if (!canNext) return
    router.push({ pathname: '/signup/info', params: { username, email, password } })
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerTitle: 'Sign Up',
          headerLeft: () => <HeaderText text="Close" textProps={{ state: true }} />
        }}
      />

      <Themed.ScrollView style={{ flex: 1, padding: 16 }}>
        <Themed.TextInput
          label="Username"
          placeholder="Username"
          autoCapitalize="none"
          onChangeText={setUsername}
          error={username.length < 4 || username.length > 30 ? 'Username must be between 4 and 30 characters' : ''}
          value={username}
        />
        <Themed.TextInput
          label="Email"
          placeholder="user@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          error={!validator.isEmail(email) ? 'Invalid email' : ''}
          onChangeText={setEmail}
          value={email}
        />
        <Themed.TextInput
          label="Password"
          placeholder="Password"
          secureTextEntry
          autoCapitalize="none"
          error={
            !validator.isStrongPassword(password)
              ? 'Password must be at least 8 characters long, containing at least 1 lowercase letter, 1 uppercase letter, 1 number and 1 symbol'
              : ''
          }
          onChangeText={setPassword}
          value={password}
        />
        <Bounceable
          style={{
            backgroundColor: canNext ? '#007AFF' : colors.secondaryBg,
            padding: 14,
            borderRadius: 16,
            marginTop: 16,
            alignItems: 'center'
          }}
          disabled={!canNext}
          onPress={onNext}
        >
          <Themed.Text style={{ fontWeight: '600', fontSize: 16 }}>Next</Themed.Text>
        </Bounceable>
      </Themed.ScrollView>
    </View>
  )
}

export default SignUpScreen
