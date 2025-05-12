import { useState, useRef } from 'react'
import { View, Text, Alert, StyleSheet, TextInput, Keyboard } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons'

import { Themed, TouchableBounce } from '@/components'
import { Stack } from '@/components/router-form'
import { useTheme, useAlbumStore } from '@/hooks'
import { useSession } from '@/contexts/auth'

const AlbumDetailModal = () => {
  const { albumID } = useLocalSearchParams<{ albumID: string }>()
  const { getAlbum, editAlbum, removeAlbum } = useAlbumStore()
  const album = getAlbum(albumID)!

  const { colors } = useTheme()
  const session = useSession()

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(album.name)
  const inputRef = useRef<TextInput>(null)

  const formattedDate = new Date(album.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const submitTitle = async () => {
    if (title.trim() === '') return
    try {
      await session.apiWithToken.post(`/album/${album.id}/edit`, {
        name: title,
        shared: album.shared,
        description: album.description
      })
      editAlbum(album.id, { name: title })
    } catch (error) {
      console.log(error)
    } finally {
      Keyboard.dismiss()
      setIsEditing(false)
    }
  }

  const handleRenamePress = async () => {
    if (isEditing) submitTitle()
    setIsEditing(!isEditing)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const deleteAlbum = async () => {
    Alert.alert('Delete Album', 'Are you sure to delete this album? This action cannot be undone.', [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await session.apiWithToken.delete(`/album/${album.id}/delete`)
            removeAlbum(album.id)
          } catch (error) {
            console.log(error)
          }
          router.dismissAll()
        }
      }
    ])
  }

  return (
    <Themed.ScrollView style={{ flex: 1, padding: 16, paddingTop: 26 }} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: 'Album Detail', sheetAllowedDetents: [0.3], headerTransparent: false }} />

      {isEditing ? (
        <TextInput
          ref={inputRef}
          value={title}
          onChangeText={setTitle}
          onSubmitEditing={submitTitle}
          returnKeyType="done"
          style={[styles.title, { color: colors.text }]}
        />
      ) : (
        <Themed.Text style={styles.title}>{title}</Themed.Text>
      )}

      <View style={{ marginBottom: 16 }}>
        {album.description && <Text style={styles.description}>{album.description}</Text>}

        <View style={styles.metaItem}>
          <Feather name="calendar" size={24} color={colors.blue} />
          <Themed.Text style={styles.metaText}>{formattedDate}</Themed.Text>
        </View>

        {album.participants && album.participants.length > 0 && (
          <View style={styles.metaItem}>
            <MaterialIcons name="people" size={24} color={colors.blue} />
            <Themed.Text style={styles.metaText}>
              {album.participants.length} {album.participants.length === 1 ? 'participant' : 'participants'}
            </Themed.Text>
          </View>
        )}

        <View style={styles.metaItem}>
          <Feather name="image" size={24} color={colors.blue} />
          <Themed.Text style={styles.metaText}>
            {album.photos.length} {album.photos.length === 1 ? 'photo' : 'photos'}
          </Themed.Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableBounce style={[styles.button, styles.buttonRename]} onPress={handleRenamePress}>
          <Ionicons
            name={isEditing ? 'checkmark' : 'pencil-outline'}
            size={16}
            color={styles.renameText.color}
            style={{ marginRight: 6 }}
          />
          <Themed.Text style={styles.renameText}>{isEditing ? 'Save new title' : 'Rename album'}</Themed.Text>
        </TouchableBounce>

        <TouchableBounce style={[styles.button, styles.buttonDelete]} onPress={deleteAlbum}>
          <Ionicons name="trash-outline" size={16} color={styles.deleteText.color} style={{ marginRight: 6 }} />
          <Themed.Text style={styles.deleteText}>Delete album</Themed.Text>
        </TouchableBounce>
      </View>
    </Themed.ScrollView>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10
  },
  buttonRename: {
    backgroundColor: 'rgba(10,132,255,0.15)',
    borderWidth: 1,
    borderColor: '#0A84FF'
  },
  buttonDelete: {
    backgroundColor: 'rgba(255,69,58,0.15)',
    borderWidth: 1,
    borderColor: '#FF453A'
  },
  renameText: {
    color: '#0A84FF',
    fontWeight: '600'
  },
  deleteText: {
    color: '#FF453A',
    fontWeight: '600'
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 16,
    lineHeight: 22
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8
  },
  metaText: {
    fontSize: 16,
    marginLeft: 6
  }
})

export default AlbumDetailModal
