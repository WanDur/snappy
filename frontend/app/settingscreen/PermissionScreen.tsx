import { useState, useEffect } from 'react'
import { Stack } from 'expo-router'
import { View, StyleSheet, Pressable, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as Contacts from 'expo-contacts'
import { PermissionResponse } from 'expo-image-picker'
import { requestRecordingPermissionsAsync, getRecordingPermissionsAsync } from 'expo-audio'

import { useTheme } from '@/hooks'
import { Themed } from '@/components'
import { IconSymbol } from '@/components/ui/IconSymbol'

const PermissionScreen = () => {
  const { colors } = useTheme()

  const [dummy, setDummy] = useState(false)
  const [contactsGranted, setContactsGranted] = useState(false)
  const [micGranted, setMicGranted] = useState(false)
  const [cameraPermission, requestCameraPermission] = ImagePicker.useCameraPermissions()
  const [mediaPermission, requestMediaPermission] = ImagePicker.useMediaLibraryPermissions()

  useEffect(() => {
    const fetchPermissions = async () => {
      const { granted: contactsGranted } = await Contacts.requestPermissionsAsync()
      setContactsGranted(contactsGranted)

      const { granted: micGranted } = await getRecordingPermissionsAsync()
      setMicGranted(micGranted)
    }

    fetchPermissions()
  }, [dummy])

  const permissions = [
    {
      name: 'Camera',
      disc: 'Allows capturing photos',
      status: cameraPermission?.granted
    },
    {
      name: 'Contacts',
      disc: 'Enables sharing with your contacts',
      status: contactsGranted
    },
    {
      name: 'Media',
      disc: 'Allows uploading photos or files',
      status: mediaPermission?.granted
    },
    {
      name: 'Microphone',
      disc: 'Required for voice messages',
      status: micGranted
    }
  ]

  const openSettings = () => {
    Alert.alert('Open Settings', 'Please open the app settings to change permissions.')
  }

  const onPress = async (feature: string) => {
    const permissionConfig: Record<string, { check?: boolean; request: () => Promise<PermissionResponse> }> = {
      Camera: {
        check: cameraPermission?.granted,
        request: requestCameraPermission
      },
      Contacts: {
        check: contactsGranted,
        request: Contacts.requestPermissionsAsync
      },
      Media: {
        check: mediaPermission?.granted,
        request: requestMediaPermission
      },
      Microphone: {
        check: micGranted,
        request: requestRecordingPermissionsAsync
      }
    }

    const { check, request } = permissionConfig[feature]

    if (check) return

    // Request permission
    const permission = await request()
    setDummy(!dummy) // Trigger re-render

    if (permission.granted) return // Permission granted
    if (permission.canAskAgain) {
      onPress(feature)
    } else {
      openSettings()
    }
  }

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

            <Pressable
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: 'rgba(120, 120, 120, 0.1)',
                padding: 6,
                paddingHorizontal: 10,
                borderRadius: 16
              }}
              onPress={() => onPress(permission.name)}
            >
              <IconSymbol
                name={permission.status ? 'checkmark' : 'exclamationmark.triangle.fill'}
                color={permission.status ? colors.blue : '#FF2D55'}
                size={14}
              />
              <Themed.Text
                style={{ fontSize: 13, fontWeight: '500', color: permission.status ? colors.blue : '#FF2D55' }}
              >
                {permission.status ? 'Working' : 'Denied'}
              </Themed.Text>
            </Pressable>
          </View>
        ))}
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
