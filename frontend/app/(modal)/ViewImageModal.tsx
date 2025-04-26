/**
 * Screen Params:
 * photoIndex: string
 * id: string
 */
import { useRef } from 'react'
import { View, FlatList, useWindowDimensions, StyleSheet } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Image } from 'expo-image'

import { Stack } from '@/components/router-form'
import { ModalCloseButton } from '@/components/ui'
import { useAlbumStore } from '@/hooks'

export default function ViewImageModal() {
  const { getAlbum } = useAlbumStore()
  const { width, height } = useWindowDimensions()
  const { photoIndex, id } = useLocalSearchParams<{ photoIndex: string; id: string }>()

  const album = getAlbum(id)!
  const listRef = useRef<FlatList>(null)

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: '', headerLeft: () => <ModalCloseButton /> }} />
      <FlatList
        ref={listRef}
        data={album.images}
        horizontal
        pagingEnabled
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={Number(photoIndex)}
        keyExtractor={(_, i) => i.toString()}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i
        })}
        renderItem={({ item }) => (
          <View style={{ width, height }}>
            <Image source={item} style={styles.fullImage} contentFit="contain" />
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black'
  },
  fullImage: {
    width: '100%',
    height: '100%',
    bottom: 20
  }
})
