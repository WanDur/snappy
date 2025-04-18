import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, FlatList } from 'react-native'
import { MaterialIcons, Feather } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import * as Crypto from 'expo-crypto'

import { Themed } from '@/components'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { Stack } from '@/components/router-form'
import { useAlbumStore } from '@/hooks'

// Get screen dimensions for responsive grid
const { width } = Dimensions.get('window')
const numColumns = 4
const gap = 2 // Gap between images
const itemSize = (width - gap * (numColumns - 1)) / numColumns // Adjusted for gaps

const AlbumScreen = () => {
  const router = useRouter()
  const { albumId } = useLocalSearchParams<{ albumId: string }>()
  const album = useAlbumStore((state) => state.getAlbum(albumId))!
  const { addImage } = useAlbumStore()

  // Format date - you may want to use a proper date formatting library
  const formattedDate = new Date(album.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const handleImagePick = async () => {
    const pickerResult = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, quality: 0.3 })

    if (!pickerResult.canceled && pickerResult.assets) {
      const selectedAssets = pickerResult.assets.map((asset) => asset.uri)
      addImage(
        album.id,
        selectedAssets.map((uri) => ({ photoId: Crypto.randomUUID(), uri }))
      )
    }
  }

  const handleAddPhotos = () => {
    handleImagePick()
  }

  const handleImagePress = (index: number) => {
    router.push({ pathname: '/screens/ViewImageScreen', params: { photoIndex: String(index), id: album.id } })
  }

  const AlbumHeader = () => (
    <View>
      <View style={styles.coverImageContainer}>
        <Image source={{ uri: album.coverImage }} style={styles.coverImage} />

        <View style={[styles.albumStatusBadge, album.isShared ? styles.sharedBadge : styles.personalBadge]}>
          <MaterialIcons
            name={album.isShared ? 'group' : 'person'}
            size={16}
            color={album.isShared ? '#4a80f5' : '#555'}
          />
          <Text style={[styles.albumStatusText, album.isShared ? styles.sharedText : styles.personalText]}>
            {album.isShared ? 'Shared Album' : 'Personal Album'}
          </Text>
        </View>
      </View>

      {/* Album Info Area */}
      <View style={styles.albumInfoContainer}>
        {album.description && <Text style={styles.description}>{album.description}</Text>}

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Feather name="calendar" size={14} color="#888" />
            <Text style={styles.metaText}>{formattedDate}</Text>
          </View>

          {album.contributors && album.contributors > 0 && (
            <View style={styles.metaItem}>
              <MaterialIcons name="people" size={14} color="#888" />
              <Text style={styles.metaText}>
                {album.contributors} {album.contributors === 1 ? 'contributor' : 'contributors'}
              </Text>
            </View>
          )}

          <View style={styles.metaItem}>
            <Feather name="image" size={14} color="#888" />
            <Text style={styles.metaText}>
              {album.images.length} {album.images.length === 1 ? 'photo' : 'photos'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )

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
      contentContainerStyle={styles.gridContainer}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          style={[styles.imageContainer, getImageContainerStyle(index)]}
          onPress={() => handleImagePress(index)}
          activeOpacity={0.85}
        >
          <Image source={{ uri: item.uri }} style={styles.image} />
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <MaterialIcons name="photo-library" size={60} color="#cccccc" />
          <Text style={styles.emptyText}>No photos in this album yet</Text>
          <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhotos} activeOpacity={0.8}>
            <MaterialIcons name="add-photo-alternate" size={18} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.addPhotoButtonText}>Add Photos</Text>
          </TouchableOpacity>
        </View>
      }
      ListHeaderComponent={<AlbumHeader />}
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
      <TouchableOpacity style={styles.fab} onPress={handleAddPhotos} activeOpacity={0.9}>
        <MaterialIcons name="add-photo-alternate" size={26} color="#fff" />
      </TouchableOpacity>
    </Themed.View>
  )
}

const styles = StyleSheet.create({
  gridContainer: {
    paddingBottom: 16 // Add padding at bottom for the FAB
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerButton: {
    padding: 8,
    marginLeft: 4
  },
  albumHeader: {
    marginBottom: 16
  },
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
  sharedBadge: {
    backgroundColor: '#eef3ff'
  },
  personalBadge: {
    backgroundColor: '#f5f5f5'
  },
  albumStatusText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6
  },
  sharedText: {
    color: '#4a80f5'
  },
  personalText: {
    color: '#555'
  },
  albumInfoContainer: {
    padding: 16
  },
  description: {
    fontSize: 16,
    color: '#444',
    marginBottom: 16,
    lineHeight: 22
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8
  },
  metaText: {
    fontSize: 13,
    color: '#888',
    marginLeft: 5
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
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4a80f5',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  fullImageContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center'
  },
  fullImage: {
    width: '100%',
    height: '100%'
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default AlbumScreen
