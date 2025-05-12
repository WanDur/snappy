/**
 * Screen Params:
 * isShared?: string
 */
import { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Switch
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Image } from 'expo-image'
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated'

import { Themed } from '@/components'
import { HeaderText } from '@/components/ui'
import { Stack } from '@/components/router-form'
import { useTheme, useAlbumStore } from '@/hooks'
import { Album } from '@/types'
import { useSettings } from '@/contexts'
import { bypassLogin, isAuthenticated, useSession, parsePublicUrl } from '@/contexts/auth'

const CreateAlbumModal = () => {
  const router = useRouter()
  const session = useSession()
  const { settings, setSetting } = useSettings()

  const { addAlbum } = useAlbumStore()
  const { colors } = useTheme()
  const { isShared } = useLocalSearchParams<{ isShared?: string }>()

  const [albumName, setAlbumName] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState<ImagePicker.ImagePickerAsset | null>(null)
  const [isCollaborative, setIsCollaborative] = useState(isShared === 'true')

  const showAddFriend = useSharedValue(isCollaborative)

  // region useEffects
  useEffect(() => {
    showAddFriend.value = isCollaborative
  }, [isCollaborative])

  useEffect(() => {
    return () => {
      setSetting('friendsToAlbum', [])
    }
  }, [])

  // endregion

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(showAddFriend.value ? 30 : 0, {
        duration: 300
      }),
      opacity: withTiming(showAddFriend.value ? 1 : 0, { duration: 300 }),
      marginTop: withTiming(showAddFriend.value ? 6 : 0, { duration: 300 })
    }
  })

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3
    })

    if (!result.canceled && result.assets) {
      setCoverImage(result.assets[0])
    }
  }

  const handleCreateAlbum = async () => {
    if (bypassLogin()) {
      return
    }
    if (!isAuthenticated(session)) {
      router.replace('/(auth)/LoginScreen')
      return
    }

    // create album with backend
    const formData = new FormData()
    formData.append('name', albumName)
    if (description.trim() !== '') {
      formData.append('description', description)
    }
    if (coverImage) {
      formData.append('coverImage', {
        uri: coverImage.uri,
        name: coverImage.fileName,
        type: coverImage.mimeType
      } as any)
    }
    formData.append('shared', isCollaborative.toString())
    session.apiWithToken
      .post('/album/create', formData)
      .then((res) => {
        const newAlbum = {
          id: res.data.albumId,
          name: albumName,
          description: description,
          coverImage: parsePublicUrl(res.data.coverImageUrl),
          isShared: isCollaborative,
          createdAt: res.data.createdAt,
          images: []
        } as Album
        addAlbum(newAlbum)
        router.back()
      })
      .catch((err) => {
        console.error(err)
      })
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerTitle: 'New Album',
          headerLeft: () => <HeaderText text="Cancel" textProps={{ state: true }} onPress={() => router.back()} />,
          headerRight: () => (
            <HeaderText text="Create" textProps={{ state: albumName.trim() !== '' }} onPress={handleCreateAlbum} />
          )
        }}
        sheet
      />

      <Themed.ScrollView contentContainerStyle={{ flex: 1, padding: 16, paddingBottom: 60 }}>
        <View style={styles.coverSection}>
          <TouchableOpacity style={styles.coverImageContainer} onPress={pickImage} activeOpacity={0.7}>
            {coverImage ? (
              <Image source={{ uri: coverImage.uri }} style={styles.coverImage} />
            ) : (
              <Themed.View style={[styles.coverImagePlaceholder, { borderColor: colors.borderColor }]} type="secondary">
                <MaterialIcons name="add-photo-alternate" size={40} color={colors.gray} />
                <Themed.Text style={styles.placeholderText} text50>
                  Add Cover
                </Themed.Text>
              </Themed.View>
            )}
          </TouchableOpacity>

          <View style={styles.albumNameContainer}>
            <TextInput
              style={[styles.albumNameInput, { color: colors.text }]}
              value={albumName}
              onChangeText={setAlbumName}
              placeholder="Album name"
              placeholderTextColor="#999"
              maxLength={30}
            />
            <Themed.Text style={styles.charCount} text30>
              {albumName.length}/30
            </Themed.Text>
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Themed.Text style={styles.label}>Description (optional)</Themed.Text>
          <Themed.TextInput
            style={[styles.input, styles.textArea, { color: colors.text }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your album..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            maxLength={150}
          />
          <Themed.Text style={styles.charCount} text30>
            {description.length}/150
          </Themed.Text>
        </View>

        <Themed.View style={styles.switchContainer} type="secondary">
          <View key={isCollaborative.toString()} style={styles.switchRow}>
            <Themed.Text style={styles.switchLabel}>
              {isCollaborative ? 'Collaborative Album' : 'Personal Album'}
            </Themed.Text>
            <Switch onValueChange={setIsCollaborative} value={isCollaborative} />
          </View>
          <Themed.Text style={{ fontSize: 14 }} text50>
            {isCollaborative ? 'Friends can add photos to this album' : 'Only you can add photos to this album'}
          </Themed.Text>
          <Animated.View style={[{ overflow: 'hidden', alignItems: 'center' }, animatedStyle]}>
            <TouchableOpacity
              style={{ padding: 2, paddingHorizontal: 16 }}
              onPress={() => router.push({ pathname: '/(modal)/AddFriendToGroupModal', params: { type: 'album' } })}
              activeOpacity={0.7}
            >
              <Themed.Text type="link">Add friend</Themed.Text>
            </TouchableOpacity>
          </Animated.View>
        </Themed.View>

        {settings.friendsToAlbum.length > 0 && (
          <Themed.View style={{ padding: 12, borderRadius: 12 }} type="secondary">
            <ScrollView style={{ width: '100%' }} horizontal>
              {settings.friendsToAlbum.map((item) => (
                <Themed.View style={styles.friendAvatar} shadow>
                  <Themed.Text>{item.slice(0, 2)}</Themed.Text>
                </Themed.View>
              ))}
            </ScrollView>
          </Themed.View>
        )}

        <TouchableOpacity style={[styles.createButton]} onPress={handleCreateAlbum}>
          <Text style={styles.createButtonText}>Create Album</Text>
        </TouchableOpacity>
      </Themed.ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  coverSection: {
    alignItems: 'center',
    marginBottom: 16
  },
  coverImageContainer: {
    width: 180,
    height: 180,
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden'
  },
  coverImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24
  },
  coverImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 24
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 16
  },
  albumNameContainer: {
    width: '100%',
    alignItems: 'center'
  },
  albumNameInput: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent'
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 12
  },
  switchContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600'
  },
  createButton: {
    backgroundColor: '#4a80f5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  friendAvatar: {
    padding: 8,
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.2,
    margin: 6
  }
})

export default CreateAlbumModal
