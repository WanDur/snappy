import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { BlurView } from 'expo-blur'
import Animated from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { GestureResponderEvent, LayoutRectangle } from 'react-native'

import { Themed } from '@/components'
import { isBetween } from '@/utils'
import { useTheme, useUserStore } from '@/hooks'
// import { useSession } from '@/contexts/auth'
import { isAxiosError } from 'axios'
import { parsePublicUrl, useSession } from '@/contexts/auth'

const ProfileAvatar = () => {
  const session = useSession()

  const router = useRouter()
  const { user, updateAvatar } = useUserStore()
  const { colors } = useTheme()

  const [imagePosition, setImagePosition] = useState({ x: -1, y: -1 })
  const [buttonsLayout, setButtonsLayout] = useState<LayoutRectangle>({ x: -1, y: -1, width: 200, height: 40 })
  const [avatarURL, setAvatarURL] = useState(user.iconUrl)

  const imageSize = 200
  const iconUrlExist = avatarURL ? avatarURL.trim() !== '' && !avatarURL.includes('null') : false

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    try {
      const formData = new FormData()
      formData.append('file', {
        uri: asset.uri,
        name: asset.fileName,
        type: asset.mimeType
      } as any)
      const response = await session.apiWithToken.post('/user/profile/icon/upload', formData)
      const iconUrl = parsePublicUrl(response.data.filePath)
      setAvatarURL(iconUrl)
      updateAvatar(iconUrl)
    } catch (error) {
      if (isAxiosError(error)) {
        Alert.alert('Error uploading avatar', error.response?.data.detail)
      } else {
        Alert.alert('Error', 'An error occurred while uploading avatar')
      }
    }
  }

  const captureAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true
    })

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadAvatar(result.assets[0])
    }
  }

  const handleCameraCapture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync()
    if (!permissionResult.granted) {
      alert('Permission to access camera is required!')
      return
    }
    const cameraResult = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true
    })
    if (!cameraResult.canceled && cameraResult.assets && cameraResult.assets.length > 0) {
      // const base64 = `data:image/jpeg;base64,${cameraResult.assets[0].base64}`
      // setAvatarURL(base64)
      // updateAvatar(base64)
      uploadAvatar(cameraResult.assets[0])
    }
  }

  const deleteAvatar = async () => {
    try {
      await session.apiWithToken.delete('/user/profile/icon/remove')
      setAvatarURL('')
      updateAvatar('')
      Alert.alert('Success', 'Icon deleted successfully')
    } catch (error) {
      if (isAxiosError(error)) {
        Alert.alert('Error deleting avatar', error.response?.data.detail)
      } else {
        Alert.alert('Error', 'An error occurred while deleting avatar')
      }
    }
  }

  const isPointOutsideBounds = (
    point: GestureResponderEvent,
    bounds: { x: number; y: number },
    size: number | [number, number]
  ) => {
    if (Array.isArray(size)) {
      // when size is an array, it means we are checking a point is inside a rectangle
      return !(
        isBetween(point.nativeEvent.pageX, bounds.x, bounds.x + size[0]) &&
        isBetween(point.nativeEvent.pageY, bounds.y, bounds.y + size[1])
      )
    } else {
      // when size is a number, it means it's a square
      return !(
        isBetween(point.nativeEvent.pageX, bounds.x, bounds.x + size) &&
        isBetween(point.nativeEvent.pageY, bounds.y, bounds.y + size)
      )
    }
  }

  const renderAvatar = () =>
    iconUrlExist ? (
      <Animated.Image
        source={{ uri: avatarURL }}
        style={[styles.avatar, { width: imageSize, height: imageSize, borderColor: colors.text }]}
        sharedTransitionTag="profileAvatar" // not working because new architecture (RN 0.76)
      />
    ) : (
      <Themed.View
        style={[
          styles.avatar,
          {
            width: imageSize,
            height: imageSize,
            borderColor: colors.text,
            justifyContent: 'center',
            alignItems: 'center'
          }
        ]}
        type="secondary"
      >
        <Ionicons name="person" size={100} color={colors.gray} />
      </Themed.View>
    )

  return (
    <BlurView
      intensity={80}
      style={styles.container}
      onTouchStart={(e) => {
        // check if touch is outside of the image and buttons
        const buttonsPosition = { x: buttonsLayout.x, y: buttonsLayout.y }
        const buttonsSize: [number, number] = [buttonsLayout.width, buttonsLayout.height]
        if (isPointOutsideBounds(e, buttonsPosition, buttonsSize) !== isPointOutsideBounds(e, imagePosition, imageSize))
          return
        router.back()
      }}
    >
      <TouchableOpacity
        style={{ position: 'relative', overflow: 'hidden', alignItems: 'center' }}
        onLayout={(e) => {
          setImagePosition({ x: e.nativeEvent.layout.x, y: e.nativeEvent.layout.y })
        }}
        activeOpacity={0.8}
        onPress={captureAvatar}
      >
        {renderAvatar()}
      </TouchableOpacity>

      <View
        style={{ flexDirection: 'row', marginTop: 20, gap: 30 }}
        onLayout={(e) => {
          // set buttons layout to calculate if touch is outside of them
          setButtonsLayout(e.nativeEvent.layout)
        }}
      >
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.headerBorderColor }]}
          onPress={handleCameraCapture}
          activeOpacity={0.7}
        >
          <Ionicons name="camera" size={28} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.headerBorderColor }]}
          onPress={captureAvatar}
          activeOpacity={0.7}
        >
          <Ionicons name="image" size={28} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.headerBorderColor }]}
          onPress={deleteAvatar}
          activeOpacity={0.7}
        >
          <Ionicons name="trash" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>
    </BlurView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 50
  },
  avatar: {
    borderRadius: 100,
    borderWidth: StyleSheet.hairlineWidth * 2
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8
  }
})

export default ProfileAvatar
