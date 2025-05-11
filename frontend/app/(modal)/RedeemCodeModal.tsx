import { useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { router } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import { Themed } from '@/components'
import { Stack } from '@/components/router-form'
import { bypassLogin, isAuthenticated, useSession } from '@/contexts/auth'
import { useUserStore } from '@/hooks'
import { UserTier } from '@/types/auth.type'

const RedeemCodeModal = () => {
  const session = useSession()

  const { user, updateTier, updatePremiumExpireTime } = useUserStore()

  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isAuthenticated(session)) {
    router.replace('/(auth)/LoginScreen')
    return
  }

  const handleSubmit = () => {
    setIsLoading(true)
    if (bypassLogin()) {
      // For development testing purposes
      setTimeout(() => {
        setIsLoading(false)
        if (code === 'code') {
          Alert.alert('Success', 'Your code has been redeemed successfully!', [
            { text: 'OK', onPress: () => router.back() }
          ])
        } else {
          Alert.alert('Error', 'Invalid code. Please try again.', [{ text: 'OK', onPress: () => setCode('') }])
        }
      }, 2000)
    } else {
      session.apiWithToken.post('/license/redeem', {
        keys: [code]
      }).then((res) => {
        updatePremiumExpireTime(new Date(res.data.premiumExpireTime))
        updateTier(UserTier.PREMIUM)
        Alert.alert('Success', 'Your code has been redeemed successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ])
      }).catch((err) => {
        console.error('Error', err.response?.data.detail)
      })
    }
  }

  return (
    <Themed.View style={{ flex: 1, padding: 16, paddingBottom: 40 }}>
      <Stack.Screen options={{ sheetAllowedDetents: [0.4] }} />
      <View style={{ paddingTop: 16, alignItems: 'center' }}>
        <MaterialCommunityIcons name="crown" size={48} color="#FFD700" />
        <Themed.Text style={styles.title}>Premium Membership</Themed.Text>
        <Themed.Text style={styles.subtitle} text70>
          Enter your code to unlock premium features
        </Themed.Text>
      </View>

      <Themed.TextInput placeholder="Redeem code" value={code} onChangeText={setCode} autoFocus />

      <TouchableOpacity
        style={[styles.redeemButton, code.trim() === '' && styles.redeemButtonDisabled]}
        onPress={handleSubmit}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFF" />
            <Text style={styles.buttonText}>Verifying</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Redeem Code</Text>
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
    elevation: 4
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
  }
})

export default RedeemCodeModal
