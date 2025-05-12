import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native'
import { useState } from 'react'
import { Stack, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { isAxiosError } from 'axios'

import { Themed, Bounceable } from '@/components'
import { useTheme } from '@/hooks'
import { useSession } from '@/contexts/auth'

const LoginScreen = () => {
  const router = useRouter()
  const { colors } = useTheme()
  const auth = useSession()
  const { signInWithCredential } = auth

  const [emailUsernamePhone, setEmailUsernamePhone] = useState('')
  const [password, setPassword] = useState('')

  const onSignIn = async () => {
    try {
      console.log('Logging in with', emailUsernamePhone)
      await signInWithCredential(emailUsernamePhone, password)
      router.replace('/(tabs)/home/index-home')
    } catch (err) {
      if (isAxiosError(err)) {
        Alert.alert('Error', err.response?.data.detail || 'An error occurred')
      } else {
        Alert.alert('Error', 'An error occurred. Please try again.')
      }
    }
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" scrollEnabled={false}>
      <Stack.Screen
        options={{
          headerTitle: 'Login',
          headerTransparent: false,
          headerLeft: () =>
            router.canGoBack() && (
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                <Ionicons name="close" size={26} color={colors.text} style={{ marginRight: 20 }} />
              </TouchableOpacity>
            )
        }}
      />

      <View style={{ marginHorizontal: 20, marginTop: 200 }}>
        <Themed.TextInput
          label="Email / Username / Phone"
          placeholder="user@example.com"
          autoCapitalize="none"
          onChangeText={setEmailUsernamePhone}
          value={emailUsernamePhone}
        />
        <Themed.TextInput
          label="Password"
          placeholder="Password"
          secureTextEntry
          autoCapitalize="none"
          onChangeText={setPassword}
          value={password}
          onSubmitEditing={onSignIn}
        />
        <Bounceable
          style={[styles.btn, { backgroundColor: colors.secondaryBg, justifyContent: 'center' }]}
          onPress={onSignIn}
        >
          <Themed.Text style={[styles.btnText, { marginLeft: 0 }]}>Login</Themed.Text>
        </Bounceable>
        <View style={styles.seperatorView}>
          <View
            style={{
              flex: 1,
              borderBottomColor: colors.borderColor,
              borderBottomWidth: StyleSheet.hairlineWidth
            }}
          />
          <Text style={styles.seperator}>or</Text>
          <View
            style={{
              flex: 1,
              borderBottomColor: colors.borderColor,
              borderBottomWidth: StyleSheet.hairlineWidth
            }}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Bounceable
            style={[styles.btn, { backgroundColor: colors.borderColor, justifyContent: 'center' }]}
            onPress={() => router.push('/(auth)/signup')}
          >
            <Themed.Text style={[styles.btnText, { marginLeft: 0 }]}>Signup</Themed.Text>
          </Bounceable>

          <Text style={styles.description}>
            By continuing you agree to Snappy's <Text style={styles.link}>Terms of Service</Text> and{' '}
            <Themed.Text style={styles.link}>Privacy Policy</Themed.Text>.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  buttonContainer: {
    gap: 20
  },
  btn: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2
  },
  btnText: {
    fontSize: 20,
    marginLeft: 50,
    fontWeight: '500'
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
    color: 'grey'
  },
  link: {
    color: 'grey',
    fontSize: 12,
    textAlign: 'center',
    textDecorationLine: 'underline'
  },
  seperatorView: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginVertical: 26
  },
  seperator: {
    fontFamily: 'mon-sb',
    color: 'grey',
    fontSize: 16
  }
})

export default LoginScreen
