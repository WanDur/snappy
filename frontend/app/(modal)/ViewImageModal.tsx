/**
 * Screen Params:
 * photoIndex: string
 * id: string
 */
import { useState, useEffect, useRef } from 'react'
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  Share,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Image } from 'expo-image'
import { BlurView } from 'expo-blur'

import { AlbumPhoto } from '@/types'
import { useAlbumStore } from '@/hooks'
import { IconSymbol } from '@/components/ui/IconSymbol'

const { width, height } = Dimensions.get('window')

export default function ViewImageModal() {
  const { getAlbum, removeImage, editAlbum } = useAlbumStore()
  const { photoIndex, id } = useLocalSearchParams<{ photoIndex: string; id: string }>()

  const [photos, setPhotos] = useState<AlbumPhoto[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const listRef = useRef<FlatList>(null)

  useEffect(() => {
    const album = getAlbum(id)
    if (album) setPhotos(album.photos)
  }, [id])

  useEffect(() => {
    if (!photos.length) return
    const start = Math.min(parseInt(photoIndex), photos.length - 1)
    listRef.current?.scrollToIndex({ index: start, animated: false })
  }, [photos, photoIndex])

  const onPageChanged = (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width)
    setCurrentIndex(idx)
  }

  const handleDelete = () => {
    if (!photos.length) return
    removeImage(id, currentIndex)

    const next = photos.filter((_, i) => i !== currentIndex)
    if (!next.length) {
      router.back()
      return
    }

    setPhotos(next)
    const newIndex = Math.min(currentIndex, next.length - 1)
    setCurrentIndex(newIndex)
    listRef.current?.scrollToIndex({ index: newIndex, animated: true })
  }

  const handleSetCover = () => {
    if (!photos[currentIndex]) return
    editAlbum(id, { coverImage: photos[currentIndex].url })
    router.back()
  }

  const handleShare = async () => {
    try {
      await Share.share({
        url: photos[currentIndex]?.url,
        message: 'Check out this photo'
      })
    } catch (err) {
      // user cancelled or share failed – swallow for now
    }
  }

  const buttons = [
    { name: 'trash.fill', onPress: handleDelete },
    { name: 'photo.fill', onPress: handleSetCover },
    { name: 'square.and.arrow.up', onPress: handleShare },
    { name: 'xmark.circle', onPress: () => router.back() }
  ]

  return (
    <View style={styles.container}>
      <BlurView style={styles.closeButton} intensity={30}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}>
          <IconSymbol name="xmark.circle" color="white" size={26} />
        </TouchableOpacity>
      </BlurView>
      <FlatList
        ref={listRef}
        data={photos}
        style={{ backgroundColor: 'black' }}
        horizontal
        pagingEnabled
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i
        })}
        renderItem={({ item }) => (
          <View style={{ width: width, height: height * 0.9 }}>
            <Image source={{ uri: item.url }} style={styles.fullImage} contentFit="contain" />
          </View>
        )}
        onMomentumScrollEnd={onPageChanged}
        initialNumToRender={1}
        windowSize={3}
      />
      <BlurView intensity={60} tint="dark" style={styles.bottomBlur}>
        {buttons.map((btn, index) => (
          <TouchableOpacity style={styles.button} onPress={btn.onPress} activeOpacity={0.7} key={index}>
            <IconSymbol name={btn.name as any} color="white" size={26} />
          </TouchableOpacity>
        ))}
      </BlurView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
  fullImage: {
    width: width,
    height: height,
    bottom: 20
  },
  closeButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    zIndex: 10,
    overflow: 'hidden'
  },
  bottomBlur: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingVertical: 16,
    bottom: -16,
    width: width,
    height: 100
  },
  button: {
    width: 44,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
