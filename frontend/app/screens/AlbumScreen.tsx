/**
 * Screen Params:
 * albumId: string
 */
import { useState } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native'
import { MaterialIcons, Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'

import { Themed } from '@/components'
import { HeaderText } from '@/components/ui'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { Stack, ContentUnavailable } from '@/components/router-form'
import { useTheme, useAlbumStore } from '@/hooks'
import { Constants } from '@/constants'
import { useSession } from '@/contexts/auth'
import { parsePublicUrl } from '@/contexts/auth'

const numColumns = 4
const gap = 2
const itemSize = (Constants.screenWidth - gap * (numColumns - 1)) / numColumns

const AlbumScreen = () => {
  const session = useSession()
  const router = useRouter()
  const { albumId } = useLocalSearchParams<{ albumId: string }>()
  const { isDark, colors } = useTheme()

  const album = useAlbumStore((state) => state.getAlbum(albumId))!

  const { addImage } = useAlbumStore()

  const [isLoading, setIsLoading] = useState(false)

  const handleImagePick = async () => {
    setIsLoading(true)
    const pickerResult = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, quality: 0.3 })

    if (!pickerResult.canceled && pickerResult.assets) {
      pickerResult.assets.forEach((asset) => {
        const formData = new FormData()
        formData.append('files', {
          name: asset.fileName,
          type: asset.mimeType,
          uri: asset.uri
        } as any)
        session.apiWithToken
          .post(`/album/${album.id}/upload`, formData)
          .then((res: any) => {
            addImage(album.id, [{ photoId: res.data.photoId, url: parsePublicUrl(res.data.filePath) }])
          })
          .catch((err) => {
            Alert.alert('Error', 'Failed to upload photo')
            console.log(err)
          })
      })

      setIsLoading(false)
    }
    setIsLoading(false)
  }

  const handleAddPhotos = () => {
    handleImagePick()
  }

  const handleImagePress = (index: number) => {
    router.push({ pathname: '/(modal)/ViewImageModal', params: { photoIndex: String(index), id: album.id } })
  }

  const AlbumHeader = () => {
    const sharedBadge = { backgroundColor: isDark ? '#2a3555' : '#eef3ff' }
    const sharedText = { color: isDark ? '#7da2ff' : '#4a80f5' }
    const personalBadge = { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5' }
    const personalText = { color: isDark ? '#bbbbbb' : '#555' }

    return (
      <View>
        <View style={styles.coverImageContainer}>
          {album.coverImage === '' ? (
            <Themed.View style={{ width: '100%', height: '80%', justifyContent: 'center', alignItems: 'center' }}>
              <ContentUnavailable
                title="Your Album is Empty"
                description="Start filling this album with memories! Tap the '+' button to add photos."
                systemImage="photo.on.rectangle.angled"
              />
            </Themed.View>
          ) : (
            <Image source={{ uri: album.coverImage }} style={styles.coverImage} />
          )}

          <TouchableOpacity
            style={[styles.albumStatusBadge, album.shared ? sharedBadge : personalBadge]}
            activeOpacity={0.8}
            onPress={() => router.push({ pathname: '/(modal)/AlbumDetailModal', params: { albumID: album.id } })}
          >
            <MaterialIcons
              name={album.shared ? 'group' : 'person'}
              size={16}
              color={album.shared ? (isDark ? '#7da2ff' : '#4a80f5') : isDark ? '#bbbbbb' : '#555'}
            />
            <Text style={[styles.albumStatusText, album.shared ? sharedText : personalText]}>
              {album.shared ? 'Shared Album' : 'Personal Album'}
            </Text>
            <Ionicons style={{ marginLeft: 4 }} name="chevron-forward" color={personalText.color} />
          </TouchableOpacity>
        </View>

        <View style={{ padding: 1 }} />
      </View>
    )
  }

  // Calculate the margin based on the item's position in the grid
  const getImageContainerStyle = (index: number) => {
    const row = Math.floor(index / numColumns)
    const col = index % numColumns

    return {
      width: itemSize,
      height: itemSize,
      marginLeft: col > 0 ? gap : 0, // No left margin for first column
      marginTop: row > 0 ? gap : 0 // No top margin for first row
    }
  }

  const GridView = () => (
    <FlatList
      data={album.photos}
      numColumns={numColumns}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{ paddingBottom: 16 }}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          style={[styles.imageContainer, getImageContainerStyle(index)]}
          onPress={() => handleImagePress(index)}
          activeOpacity={0.85}
        >
          <Image source={{ uri: item.url }} style={styles.image} />
        </TouchableOpacity>
      )}
      ListHeaderComponent={<AlbumHeader />}
      ListEmptyComponent={
        album.coverImage ? (
          <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
            <ContentUnavailable
              title="Your Album is Empty"
              description="Start filling this album with memories! Tap the '+' button to add photos."
              systemImage="photo.on.rectangle.angled"
            />
          </View>
        ) : undefined
      }
      contentInsetAdjustmentBehavior="automatic"
    />
  )

  return (
    <Themed.View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerTitle: album.name,
          headerRight: () => (
            <HeaderText
              onPress={() => router.push({ pathname: '/(modal)/AlbumDetailModal', params: { albumID: album.id } })}
            >
              <IconSymbol name="ellipsis.circle" color={colors.text} />
            </HeaderText>
          )
        }}
      />

      <GridView />

      <TouchableOpacity
        style={[styles.fab, { shadowColor: colors.text }]}
        onPress={handleAddPhotos}
        activeOpacity={0.9}
      >
        {isLoading ? <ActivityIndicator color="#fff" /> : <IconSymbol name="plus" color="#fff" />}
      </TouchableOpacity>
    </Themed.View>
  )
}

const styles = StyleSheet.create({
  coverImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative'
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },
  albumStatusBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },
  albumStatusText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6
  },
  imageContainer: {
    // Base styles only - dynamic margins are applied in getImageContainerStyle
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover' // Ensures images fill the container
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  }
})

export default AlbumScreen
