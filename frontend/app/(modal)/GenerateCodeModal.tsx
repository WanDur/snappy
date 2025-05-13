import { useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert, Switch } from 'react-native'
import { router } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'

import { Themed } from '@/components'
import { Stack } from '@/components/router-form'
import { bypassLogin, isAuthenticated, useSession } from '@/contexts/auth'
import { useUserStore } from '@/hooks'
import { UserTier } from '@/types/auth.type'

const ymdhms = (d: Date): string => {
  const y = d.getFullYear()
  const m = `0${d.getMonth() + 1}`.slice(-2)
  const day = `0${d.getDate()}`.slice(-2)
  const h = `0${d.getHours()}`.slice(-2)
  const min = `0${d.getMinutes()}`.slice(-2)
  const s = `0${d.getSeconds()}`.slice(-2)
  return `${y}${m}${day}${h}${min}${s}`
}

const RedeemCodeModal = () => {
  const session = useSession()

  const [days, setDays] = useState('')
  const [count, setCount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isAuthenticated(session)) {
    router.replace('/(auth)/LoginScreen')
    return
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    const res = await session.apiWithToken.post('/license/generate', {
      days: parseInt(days),
      count: parseInt(count)
    })
    const fileUri = FileSystem.documentDirectory + `generated_codes_${ymdhms(new Date())}.key`
    const content = res.data.keys.join('\n')
    await FileSystem.writeAsStringAsync(fileUri, content)
    await Sharing.shareAsync(fileUri)
    setDays('')
    setCount('')
    setIsLoading(false)
  }

  const readyToSubmit = () => {
    return parseInt(days) > 0 && parseInt(count) > 0
  }

  return (
    <Themed.View style={{ flex: 1, padding: 16, paddingBottom: 40 }}>
      <Stack.Screen options={{ sheetAllowedDetents: [0.46] }} />
      <View style={{ paddingVertical: 16, alignItems: 'center' }}>
        <MaterialCommunityIcons name="crown" size={48} color="#FFD700" />
        <Themed.Text style={styles.title}>Generate Premium Code</Themed.Text>
      </View>

      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Themed.TextInput containerStyle={styles.inputContainer} inputStyle={{ textAlign: 'center' }} placeholder="Days" value={days} onChangeText={setDays} keyboardType="numeric" autoFocus />
        <Themed.TextInput containerStyle={styles.inputContainer} inputStyle={{ textAlign: 'center' }} placeholder="Count" value={count} onChangeText={setCount} keyboardType="numeric" />
      </View>

      <TouchableOpacity
        style={[styles.redeemButton, !readyToSubmit() && styles.redeemButtonDisabled]}
        onPress={handleSubmit}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFF" />
            <Text style={styles.buttonText}>Generating</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Generate</Text>
        )}
      </TouchableOpacity>
    </Themed.View>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
    marginBottom: 16
  },
  redeemButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
    marginTop: 8
  },
  redeemButtonDisabled: {
    backgroundColor: '#AAAAAA',
    shadowOpacity: 0
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700'
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  inputContainer: {
    width: 200,
    marginHorizontal: 8
  }
})

export default RedeemCodeModal
