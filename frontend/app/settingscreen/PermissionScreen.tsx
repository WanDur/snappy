import { useState, useEffect } from 'react'
import { Stack } from 'expo-router'
import { View, Switch, StyleSheet, Pressable, Linking } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as Contacts from 'expo-contacts'

import { useTheme } from '@/hooks'
import { Themed } from '@/components'

const PermissionScreen = () => {
  const { colors } = useTheme()

  const [dummy, setDummy] = useState(false)
  const [contactsGranted, setContactsGranted] = useState(false)
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions()
  const [mediaPermission, requestMediaPermission] = ImagePicker.useMediaLibraryPermissions()

  useEffect(() => {
    const fetchPermissions = async () => {
      const { granted } = await Contacts.getPermissionsAsync()
      setContactsGranted(granted)
    }

    fetchPermissions()
  }, [dummy])

  const permissions = [
    {
      name: 'Camera',
      disc: 'Allows capturing photos',
      status: cameraPermission?.granted,
      onPress: requestCameraPermission
    },
    {
      name: 'Contacts',
      disc: 'Enables sharing with your contacts',
      status: contactsGranted,
      onPress: Contacts.requestPermissionsAsync
    },
    {
      name: 'Location',
      disc: 'Enables finding jobs based on your location',
      status: false,
      onPress: () => {
        requestCameraPermission()
        setDummy((prev) => !prev)
      }
    },
    {
      name: 'Media',
      disc: 'Allows uploading photos or files',
      status: mediaPermission?.granted,
      onPress: requestMediaPermission
    },
    {
      name: 'Microphone',
      disc: 'Required for voice messages',
      status: false,
      onPress: () => {}
    }
  ]

  return (
    <Themed.ScrollView>
      <Stack.Screen
        options={{
          headerTitle: 'Permissions',
          headerBackTitle: 'Settings'
        }}
      />
      <View style={{ padding: 16, paddingTop: 0 }}>
        {permissions.map((permission, index) => (
          <View
            style={[
              styles.toggleContainer,
              {
                borderBottomColor: colors.borderColor,
                borderBottomWidth: index === permissions.length - 1 ? 0 : StyleSheet.hairlineWidth
              }
            ]}
            key={index}
          >
            <View>
              <Themed.Text style={styles.title}>{permission.name}</Themed.Text>
              <Themed.Text style={styles.subText}>{permission.disc}</Themed.Text>
            </View>

            <Switch value={permission.status} onTouchEnd={permission.onPress} trackColor={{ true: '#007AFF' }} />
          </View>
        ))}
      </View>
      <Themed.View type="divider" />
      <View style={{ flexDirection: 'row', paddingHorizontal: 26, paddingTop: 20 }}>
        <Themed.Text style={{ lineHeight: 30, fontSize: 16 }}>Open </Themed.Text>
        <Pressable
          onPress={() => {
            // TODO: android open settings, this only works on ios
            Linking.openURL('app-settings:')
          }}
        >
          <Themed.Text type="link">Settings</Themed.Text>
        </Pressable>
      </View>
    </Themed.ScrollView>
  )
}

const styles = StyleSheet.create({
  toggleContainer: {
    height: 66,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4
  },
  subText: {
    fontSize: 13,
    color: '#6b7280'
  }
})

export default PermissionScreen
