import { View, Text, StyleSheet } from 'react-native'
import { useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import RNPickerSelect from 'react-native-picker-select'

import { Themed, Bounceable } from '@/components'
import { Stack } from '@/components/router-form'
import { useTheme } from '@/hooks'

const SignUpInfo = () => {
  const { username, email, password } = useLocalSearchParams<{ username: string; email: string; password: string }>()
  const { colors, isDark } = useTheme()
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [honorific, setHonorific] = useState('')

  const canNext = firstName.length > 0 && lastName.length > 0 && honorific !== ''

  const onSignUp = async () => {
    if (!canNext) return
    console.log('Signing up with', username, email, password, firstName, lastName, honorific)
    router.dismissTo('/(auth)/LoginScreen')
    // TODO send request to server and confirm result
    /*
    try {
      await signUpWithCredential(
        {
          username,
          email,
          password,
          name: `${firstName} ${lastName}`
        },
        {
          firstName,
          lastName,
          honorific
        },
        settings.userType!
      )
      router.back()
      Alert.alert('Success', 'Please check your email to verify')
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Error', err.message)
      }
    }*/
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Signup Info' }} />
      <Themed.ScrollView style={{ flex: 1, padding: 16 }} keyboardShouldPersistTaps="handled">
        <Themed.TextInput
          label="First Name"
          placeholder="First Name"
          autoCapitalize="words"
          onChangeText={setFirstName}
          error={firstName.length === 0 ? 'Required' : ''}
          value={firstName}
          autoFocus
        />
        <Themed.TextInput
          label="Last Name"
          placeholder="Last Name"
          autoCapitalize="words"
          error={lastName.length === 0 ? 'Required' : ''}
          onChangeText={setLastName}
          value={lastName}
        />
        <Themed.Text style={styles.label}>Honorific</Themed.Text>
        <RNPickerSelect
          style={{
            viewContainer: {
              borderRadius: 12,
              height: 50,
              padding: 14,
              backgroundColor: isDark ? '#2d2d37' : 'rgb(229, 229, 234)',
              marginBottom: 16,
              justifyContent: 'center'
            },
            inputIOSContainer: {
              pointerEvents: 'none',
              height: 50,
              justifyContent: 'center'
            },
            inputIOS: { color: colors.text, fontSize: 16 },
            placeholder: { color: 'grey' }
          }}
          value={honorific}
          onValueChange={setHonorific}
          placeholder={{ label: 'Honorific', value: null, color: 'grey' }}
          items={['mr', 'ms', 'mrs', 'dr'].map((hon) => ({ label: `honorific.${hon}`, value: hon }))}
          darkTheme={isDark}
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
          onPress={onSignUp}
        >
          <Themed.Text style={{ fontWeight: '600', fontSize: 16 }}>Sign Up</Themed.Text>
        </Bounceable>
      </Themed.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    marginLeft: 4,
    marginBottom: 4
  }
})

export default SignUpInfo
