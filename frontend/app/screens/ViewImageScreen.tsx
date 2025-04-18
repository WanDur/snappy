import { FlatList, Image, useWindowDimensions, StyleSheet } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useRef } from 'react'

import { useAlbumStore } from '@/hooks'

export default function ViewImageScreen() {
  const { getAlbum, albumList } = useAlbumStore()
  const { width, height } = useWindowDimensions()
  const { photoIndex, id } = useLocalSearchParams<{ photoIndex: string; id: string }>()

  const album = getAlbum(id)!
  const listRef = useRef<FlatList>(null)

  return (
    <FlatList
      ref={listRef}
      data={album.images}
      horizontal
      pagingEnabled
      initialScrollIndex={Number(photoIndex)}
      keyExtractor={(_, i) => i.toString()}
      getItemLayout={(_, i) => ({
        length: width,
        offset: width * i,
        index: i
      })}
      renderItem={({ item }) => <Image source={item} style={[styles.full, { width, height }]} />}
    />
  )
}

const styles = StyleSheet.create({
  full: { resizeMode: 'contain' }
})
