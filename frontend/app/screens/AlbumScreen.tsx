/**
 * Screen Params:
 * albumId: string
 */
import { useState, useRef } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as Crypto from 'expo-crypto'
import { BottomSheetView, BottomSheetModal } from '@gorhom/bottom-sheet'

import { Themed } from '@/components'
import { BlurredHandle, BlurredBackground } from '@/components/bottomsheetUI'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { Stack, ContentUnavailable } from '@/components/router-form'
import { useTheme, useAlbumStore } from '@/hooks'
import { Constants } from '@/constants'

const numColumns = 4
const gap = 2
const itemSize = (Constants.screenWidth - gap * (numColumns - 1)) / numColumns

const AlbumScreen = () => {
  const router = useRouter()
  const { albumId } = useLocalSearchParams<{ albumId: string }>()
  const { isDark, colors } = useTheme()

  const album = useAlbumStore((state) => state.getAlbum(albumId))!
  const { addImage } = useAlbumStore()

  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const [isLoading, setIsLoading] = useState(false)

  const formattedDate = new Date(album.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const handleImagePick = async () => {
    setIsLoading(true)
    const pickerResult = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, quality: 0.3 })

    if (!pickerResult.canceled && pickerResult.assets) {
      const selectedAssets = pickerResult.assets.map((asset) => asset.uri)
      addImage(
        album.id,
        selectedAssets.map((uri) => ({ photoId: Crypto.randomUUID(), uri }))
      )
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
            style={[styles.albumStatusBadge, album.isShared ? sharedBadge : personalBadge]}
            activeOpacity={0.8}
            onPress={() => bottomSheetModalRef.current?.present()}
          >
            <MaterialIcons
              name={album.isShared ? 'group' : 'person'}
              size={16}
              color={album.isShared ? (isDark ? '#7da2ff' : '#4a80f5') : isDark ? '#bbbbbb' : '#555'}
            />
            <Text style={[styles.albumStatusText, album.isShared ? sharedText : personalText]}>
              {album.isShared ? 'Shared Album' : 'Personal Album'}
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
      data={album.images}
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
          <Image source={{ uri: item.uri }} style={styles.image} />
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
          headerTitle: album.title
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

      <BottomSheetModal
        index={1}
        ref={bottomSheetModalRef}
        snapPoints={['30%']}
        handleComponent={BlurredHandle}
        backgroundComponent={BlurredBackground}
        backdropComponent={() => (
          <View onTouchEnd={() => bottomSheetModalRef.current?.close()} style={[StyleSheet.absoluteFill]} />
        )}
      >
        <BottomSheetView style={{ flex: 1, padding: 16 }}>
          <Themed.Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 16 }}>{album.title}</Themed.Text>

          <View style={{ marginBottom: 16 }}>
            {album.description && <Text style={styles.description}>{album.description}</Text>}

            <View style={styles.metaItem}>
              <Feather name="calendar" size={24} color={colors.blue} />
              <Themed.Text style={styles.metaText}>{formattedDate}</Themed.Text>
            </View>

            {album.contributors && album.contributors > 0 && (
              <View style={styles.metaItem}>
                <MaterialIcons name="people" size={24} color={colors.blue} />
                <Themed.Text style={styles.metaText}>
                  {album.contributors} {album.contributors === 1 ? 'contributor' : 'contributors'}
                </Themed.Text>
              </View>
            )}

            <View style={styles.metaItem}>
              <Feather name="image" size={24} color={colors.blue} />
              <Themed.Text style={styles.metaText}>
                {album.images.length} {album.images.length === 1 ? 'photo' : 'photos'}
              </Themed.Text>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
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
  },
  imageContainer: {
    // Base styles only - dynamic margins are applied in getImageContainerStyle
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover' // Ensures images fill the container
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 16,
    marginBottom: 24
  },
  addPhotoButton: {
    backgroundColor: '#4a80f5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonIcon: {
    marginRight: 8
  },
  addPhotoButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 30,
    backgroundColor: '#4a80f5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  fullImage: {
    width: '100%',
    height: '100%'
  }
})

export default AlbumScreen
