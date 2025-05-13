import { View, Text, StyleSheet, Alert } from 'react-native'
import { useState } from 'react'
import { useRouter, useLocalSearchParams } from 'expo-router'
import RNPickerSelect from 'react-native-picker-select'
import CountryPicker, { CountryCode, DARK_THEME, DEFAULT_THEME } from 'react-native-country-picker-modal'

import { Themed, Bounceable } from '@/components'
import { Stack } from '@/components/router-form'
import { useTheme } from '@/hooks'
import { useSession } from '@/contexts/auth'

const SignUpInfo = () => {
  const { username, email, password } = useLocalSearchParams<{ username: string; email: string; password: string }>()
  const { colors, isDark } = useTheme()
  const { signUpWithCredential } = useSession()
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [countryCode, setCountryCode] = useState<CountryCode>('HK')
  const [callingCode, setCallingCode] = useState<string>('+852')
  const [phoneNumber, setPhoneNumber] = useState<string>('')

  const canNext = displayName.length > 0

  const onSignUp = async () => {
    if (!canNext) return
    console.log('Signing up with', username, email, password, displayName)

    try {
      await signUpWithCredential({
        username,
        email,
        password,
        name: displayName,
        phone: `(${callingCode}) ${phoneNumber}`
      })
      router.dismissTo('/(auth)/LoginScreen')
      Alert.alert('Success', 'You may login to your account now')
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Error', err.message)
        router.dismissTo('/(auth)/LoginScreen')
      }
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Signup Info' }} />
      <Themed.ScrollView style={{ flex: 1, padding: 16 }} keyboardShouldPersistTaps="handled">
        <Themed.TextInput
          label="Display Name"
          placeholder="Display Name"
          autoCapitalize="words"
          onChangeText={setDisplayName}
          error={displayName.length === 0 ? 'Required' : ''}
          value={displayName}
          autoFocus
        />
        <Themed.Text style={styles.label}>Phone</Themed.Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? '#2d2d37' : 'rgb(229, 229, 234)',
            minHeight: 50,
            padding: 8,
            borderRadius: 12,
            marginBottom: 16
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CountryPicker
              countryCode={countryCode}
              onSelect={(country) => {
                setCountryCode(country.cca2)
                setCallingCode(country.callingCode[0])
                console.log(country.callingCode)
              }}
              containerButtonStyle={{
                marginHorizontal: 16
              }}
              theme={isDark ? DARK_THEME : DEFAULT_THEME}
              withCallingCode
              withCallingCodeButton
              withFlagButton
              preferredCountries={['HK', 'MO', 'CN', 'TW']}
            />

            <Themed.TextInput
              placeholder="Phone Number"
              onChangeText={setPhoneNumber}
              value={phoneNumber}
              keyboardType="phone-pad"
              containerStyle={{ flex: 1, top: 8 }}
            />
          </View>
        </View>

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
