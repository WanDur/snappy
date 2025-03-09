import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native'
import React, { useRef, useState } from 'react'
import { Stack, router, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import RNPickerSelect from 'react-native-picker-select'

import { Themed, Bounceable, Pagination } from '@/components'
import { useTheme } from '@/hooks'
//import { useSession } from '@/contexts/auth'
import { isAxiosError } from 'axios'
import validator from 'validator'
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel'
import { useTranslation } from 'react-i18next'
import { useSettings } from '@/contexts'

const { width, height } = Dimensions.get('window')

const SignUpScreen = () => {
  const router = useRouter()
  const { colors } = useTheme()
  //const auth = useSession()
  const { t } = useTranslation()
  //const { signUpWithCredential } = auth
  const { isDark } = useTheme()
  const { settings } = useSettings()

  const carouselRef = useRef<ICarouselInstance>(null)

  const [step, setStep] = useState(0)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [honorific, setHonorific] = useState('')

  const onSignUp = async () => {
    // TODO send request to server and confirm result
    return
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
    }
  }

  const canNext = () => {
    switch (step) {
      case 0:
        return (
          username.length >= 4 &&
          username.length <= 30 &&
          email.length > 0 &&
          validator.isEmail(email) &&
          password.length > 0 &&
          validator.isStrongPassword(password)
        )
      case 1:
        return firstName.length > 0 && lastName.length > 0 && honorific !== ''
      case 2:
        return true
    }
  }

  return (
    <Themed.View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Sign Up',
          headerLeft: () =>
            router.canGoBack() && (
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
                <Ionicons name="arrow-back-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            )
        }}
      />

      <Carousel
        ref={carouselRef}
        loop={false}
        width={width}
        height={height}
        style={{ justifyContent: 'center', alignItems: 'center' }}
        onSnapToItem={(index) => setStep(index)}
        data={[...new Array(2).keys()]}
        renderItem={({ index }) => {
          switch (index) {
            case 0:
              return (
                <Themed.View style={[styles.secondaryContainer, { shadowColor: colors.text }]} type="secondary">
                  <Themed.TextInput
                    label="Username"
                    placeholder="Username"
                    autoCapitalize="none"
                    onChangeText={setUsername}
                    error={
                      username.length < 4 || username.length > 30 ? 'Username must be between 4 and 30 characters' : ''
                    }
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
                </Themed.View>
              )
            case 1:
              return (
                <Themed.View style={[styles.secondaryContainer, { shadowColor: colors.text }]} type="secondary">
                  <Themed.TextInput
                    label="First Name"
                    placeholder="First Name"
                    autoCapitalize="words"
                    onChangeText={setFirstName}
                    error={firstName.length === 0 ? 'Required' : ''}
                    value={firstName}
                  />
                  <Themed.TextInput
                    label="Last Name"
                    placeholder="Last Name"
                    autoCapitalize="words"
                    error={lastName.length === 0 ? 'Required' : ''}
                    onChangeText={setLastName}
                    value={lastName}
                  />
                  <Text style={styles.label}>Honorific</Text>
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
                    items={['mr', 'ms', 'mrs', 'dr'].map((hon) => ({ label: t(`honorific.${hon}`), value: hon }))}
                    darkTheme={isDark}
                  />
                </Themed.View>
              )
            default:
              return <></>
          }
        }}
      />
      <Pagination
        caroselRef={carouselRef}
        total={2}
        selectedIndex={step}
        onIndexChange={setStep}
        disableButton={!canNext()}
        finishButtonPress={onSignUp}
      />

      <View style={{ marginHorizontal: 20 }}></View>
    </Themed.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  secondaryContainer: {
    height: height * 0.5,
    width: width * 0.9,
    marginTop: 100,
    borderRadius: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: 16,
    paddingTop: 32,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5
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
  label: {
    marginLeft: 4,
    marginBottom: 4
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

export default SignUpScreen
