import React, { useState } from 'react'
import {
  View,
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
import * as Crypto from 'expo-crypto'
import { router } from 'expo-router'
import { Image } from 'expo-image'

import { Themed } from '@/components'
import { HeaderText } from '@/components/ui'
import { Stack } from '@/components/router-form'
import { useTheme, useAlbumStore } from '@/hooks'

const CreateAlbumModal = () => {
  const { addAlbum } = useAlbumStore()
  const { colors } = useTheme()

  const [albumName, setAlbumName] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [isCollaborative, setIsCollaborative] = useState(false)

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3
    })

    if (!result.canceled && result.assets) {
      setCoverImage(result.assets[0].uri)
    }
  }

  const handleCreateAlbum = () => {
    const newAlbum = {
      id: Crypto.randomUUID(),
      title: albumName,
      description: description,
      coverImage: coverImage,
      isShared: isCollaborative,
      createdAt: new Date().toISOString(),
      images: []
    }

    addAlbum(newAlbum)
    router.back()
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerTitle: 'New Album',
          headerRight: () => (
            <HeaderText text="Create" textProps={{ state: albumName.trim() !== '' }} onPress={handleCreateAlbum} />
          )
        }}
        sheet
      />

      <Themed.ScrollView contentContainerStyle={{ flex: 1, padding: 16 }}>
        <View style={styles.coverSection}>
          <TouchableOpacity style={styles.coverImageContainer} onPress={pickImage} activeOpacity={0.7}>
            {coverImage ? (
              <Image source={{ uri: coverImage }} style={styles.coverImage} />
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
          <View style={styles.switchRow}>
            <Themed.Text style={styles.switchLabel}>Collaborative Album</Themed.Text>
            <Switch
              trackColor={{ false: '#e0e0e0', true: '#b3cdf8' }}
              thumbColor={isCollaborative ? '#4a80f5' : '#f4f3f4'}
              ios_backgroundColor="#e0e0e0"
              onValueChange={setIsCollaborative}
              value={isCollaborative}
            />
          </View>
          <Themed.Text style={{ fontSize: 14 }} text50>
            {isCollaborative ? 'Friends can add photos to this album' : 'Only you can add photos to this album'}
          </Themed.Text>
        </Themed.View>

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
    borderRadius: 24, // Rounded square
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
  createButtonDisabled: {
    backgroundColor: '#cccccc'
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  }
})

export default CreateAlbumModal
