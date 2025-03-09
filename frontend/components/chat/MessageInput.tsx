import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import React, { useState, useCallback } from 'react'
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { Ionicons, FontAwesome } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { ComposerProps } from 'react-native-gifted-chat'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Constants } from '@/constants'
import Themed from '../themed/Themed'
import SelectedFileAnimation from '../SelectedFileAnimation'
import { Attachment, TMessage } from '@/types/chats.type'
import { useTheme } from '@/hooks'

const ATouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity)

interface MessageInputProps extends ComposerProps {
  textInputRef: React.RefObject<TextInput>
  onSend: (message: string, attachments?: Attachment[]) => void
}

const MessageInput = ({ textInputRef, onSend, ...props }: MessageInputProps) => {
  const expanded = useSharedValue(0)
  const { bottom } = useSafeAreaInsets()
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loadingImage, setLoadingImage] = useState(false)

  const { colors } = useTheme()

  const expandItems = () => {
    expanded.value = withTiming(1, { duration: 400 })
  }

  const collapseItems = () => {
    expanded.value = withTiming(0, { duration: 400 })
  }

  const expandButtonStyle = useAnimatedStyle(() => {
    const opacityInterpolation = interpolate(expanded.value, [0, 1], [1, 0], Extrapolation.CLAMP)
    const widthInterpolation = interpolate(expanded.value, [0, 1], [30, 0], Extrapolation.CLAMP)

    return {
      opacity: opacityInterpolation,
      width: widthInterpolation
    }
  })

  const buttonViewStyle = useAnimatedStyle(() => {
    // 130 for 4 buttons
    const widthInterpolation = interpolate(expanded.value, [0, 1], [0, 100], Extrapolation.CLAMP)
    return {
      width: widthInterpolation,
      opacity: expanded.value
    }
  })

  const ImagePreview = useCallback(() => {
    if (loadingImage) {
      return (
        <View
          style={{
            width: 38,
            height: 38,
            position: 'absolute',
            justifyContent: 'center',
            left: 10,
            bottom: bottom
          }}
        >
          <ActivityIndicator size="small" />
        </View>
      )
    } else if (attachments.length > 0) {
      const items = attachments.map((file, index) => ({ key: index.toString(), attachment: file }))
      return (
        <View style={{ position: 'absolute', zIndex: 100, bottom: 50 + bottom }}>
          <SelectedFileAnimation data={items} isLoading={loadingImage} />
        </View>
      )
    }
  }, [attachments, loadingImage])

  const handleCameraCapture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync()
    if (!permissionResult.granted) {
      alert('Permission to access camera is required!')
      return
    }
    const cameraResult = await ImagePicker.launchCameraAsync({ quality: 0.5 })
    if (!cameraResult.canceled && cameraResult.assets && cameraResult.assets.length > 0) {
      const { assetId, uri, fileName, type, mimeType, base64, ...rest } = cameraResult.assets[0]
      setAttachments([
        {
          url: cameraResult.assets[0].uri,
          name: cameraResult.assets[0].fileName || cameraResult.assets[0].uri.split('/').pop()!,
          type: cameraResult.assets[0].mimeType || `image/${cameraResult.assets[0].uri.split('.').pop()}`,
          metaData: rest
        }
      ])
    }
  }

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permissionResult.granted) {
      alert('Permission to access media library is required!')
      return
    }

    // collapse item instantly
    expanded.value = withTiming(0, { duration: 0 })
    setLoadingImage(true)
    const pickerResult = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, quality: 0.5 })
    setLoadingImage(false)

    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
      setAttachments(
        pickerResult.assets.map((asset) => {
          const { assetId, uri, fileName, type, mimeType, base64, ...rest } = asset
          return {
            url: asset.uri,
            name: asset.fileName || asset.uri.split('/').pop(),
            type: asset.mimeType || `image/${asset.uri.split('.').pop()}`,
            metaData: rest
          } as Attachment
        })
      )
    }
  }

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({})
      if ('assets' in result && result.assets !== null && result.assets.length > 0) {
        setAttachments([
          ...attachments,
          ...result.assets.map(
            (asset) =>
              ({
                url: asset.uri,
                name: asset.name,
                type: asset.mimeType || `application/octet-stream`
              } as Attachment)
          )
        ])
      }
    } catch (error) {
      console.error('Error picking document: ', error)
    }
  }

  const resetInputText = () => {
    props.onTextChanged!('') // clear text input states
    textInputRef.current?.clear()
  }

  const onSendText = () => {
    if (props.text?.trim() === '' && !attachments) {
      // user send empty message
      return
    }
    if (attachments) {
      onSend(props.text?.trim() || '', attachments)
      clearAttachments()
    } else if (props.text) {
      onSend(props.text?.trim())
    }
    resetInputText()
  }

  const clearAttachments = () => {
    setAttachments([])
    collapseItems()
  }

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 10
    },
    roundBtn: {
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: -6
    },
    buttonView: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12
    },
    messageInput: {
      flex: 1,
      marginHorizontal: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 20,
      justifyContent: 'center',
      padding: 10,
      borderColor: colors.borderColor,
      maxHeight: 100,
      color: colors.text
    }
  })

  return (
    // #FIXME: android workaround for showing inputbar
    <Themed.View style={[styles.container, { paddingBottom: Constants.isIOS ? bottom : bottom }]}>
      {attachments.length == 0 && (
        <>
          <ATouchableOpacity onPress={expandItems} style={[styles.roundBtn, expandButtonStyle]}>
            {!loadingImage && <Ionicons name="add" size={28} color={'grey'} />}
          </ATouchableOpacity>
          <Animated.View style={[styles.buttonView, buttonViewStyle]}>
            <TouchableOpacity onPress={handleCameraCapture}>
              <Ionicons name="camera-outline" size={24} color="grey" />
            </TouchableOpacity>

            {/*<TouchableOpacity style={{ marginHorizontal: -4 }}>
              <Ionicons name="mic-outline" size={24} color="grey" />
            </TouchableOpacity>
            */}
            <TouchableOpacity onPress={handleImagePick}>
              <Ionicons name="image-outline" size={24} color="grey" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleFileUpload}>
              <Ionicons name="folder-outline" size={24} color="grey" />
            </TouchableOpacity>
          </Animated.View>
        </>
      )}

      {attachments.length > 0 && (
        <TouchableOpacity style={{ borderRadius: 12, marginLeft: -6 }} onPress={clearAttachments} activeOpacity={0.7}>
          <Ionicons name="close-circle" size={30} color="red" />
        </TouchableOpacity>
      )}

      <ImagePreview />

      <TextInput
        ref={textInputRef}
        multiline
        style={styles.messageInput}
        value={props.text}
        onChangeText={props.onTextChanged}
        onPress={collapseItems}
        onBlur={() => {
          if (props.text?.trim() === '') resetInputText()
        }}
      />

      <TouchableOpacity onPress={onSendText}>
        <FontAwesome name="send-o" size={20} color="#007AFF" />
      </TouchableOpacity>
    </Themed.View>
  )
}

export default MessageInput
