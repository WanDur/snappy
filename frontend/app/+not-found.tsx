import { StyleSheet, TouchableOpacity } from 'react-native'
import { Stack, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { Themed } from '@/components'
import { Constants } from '@/constants'

export default function NotFoundScreen() {
  return (
    <Themed.View style={styles.container}>
      <Stack.Screen
        options={{
          title: '',
          headerBackTitle: 'Back'
        }}
      />
      <Ionicons
        name="alert-circle-outline"
        size={80}
        color="#FF6347"
        style={styles.icon}
        accessibilityLabel="Error icon"
      />
      <Themed.Text type="title" style={styles.title}>
        Oops! We can't find the page.
      </Themed.Text>
      <Themed.Text style={styles.subtitle}>
        The page you're looking for might have been removed or is temporarily unavailable.
      </Themed.Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          router.dismissAll()
          router.replace('/')
        }}
        activeOpacity={0.7}
      >
        <Themed.Text style={{ fontWeight: '600' }}>Back to home</Themed.Text>
      </TouchableOpacity>
      <Themed.Text style={{ fontSize: 14, color: 'grey' }}>Contact support</Themed.Text>
    </Themed.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: -50
  },
  icon: {
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: Constants.screenWidth * 0.8
  },
  button: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#FF6347',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  }
})
