import { useState, memo, useMemo } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import { useAlbumStore, useTheme } from '@/hooks'
import { Themed, SectionHeader } from '@/components'
import { IconSymbolName } from '@/components/ui/IconSymbolFallback'
import { Form, Stack, ContentUnavailable } from '@/components/router-form'
import { Album } from '@/types'

const AlbumCover = memo(
  ({
    coverImage,
    style,
    placeholderStyle,
    isShared,
    contributors
  }: {
    coverImage: string
    style: ViewStyle
    placeholderStyle: ViewStyle
    isShared: boolean
    contributors?: number
  }) => {
    const { colors } = useTheme()
    const commonPlaceholderStyles: StyleProp<ViewStyle> = [
      placeholderStyle,
      { alignItems: 'center', justifyContent: 'center' }
    ]

    // if the album is at small size, use a smaller icon size
    const iconSize = typeof style.width === 'string' ? 64 : Number(style.width) * 0.4

    return (
      <View style={style}>
        {coverImage === '' ? (
          <Themed.View type="secondary" style={commonPlaceholderStyles}>
            <Ionicons name="image" size={iconSize} color={colors.borderColor} />
          </Themed.View>
        ) : (
          <Image source={{ uri: coverImage }} style={StyleSheet.absoluteFillObject} contentFit="cover" />
        )}
      </View>
    )
  }
)

const EmptyContent = ({
  title,
  systemImage,
  actionText,
  onAction
}: {
  title: string
  systemImage: IconSymbolName
  actionText: string
  onAction: () => void
}) => (
  <Form.Section style={{ marginHorizontal: -16 }}>
    <ContentUnavailable
      title={title}
      systemImage={systemImage}
      actions={
        <TouchableOpacity activeOpacity={0.7} onPress={onAction}>
          <Themed.Text type="link">{actionText}</Themed.Text>
        </TouchableOpacity>
      }
    />
  </Form.Section>
)

const AlbumScreen = () => {
  const router = useRouter()
  const { albumList } = useAlbumStore()
  const { colors } = useTheme()

  const [viewMode, setViewMode] = useState('grid')
  const personalAlbums = useMemo(() => albumList.filter((album) => !album.isShared), [albumList])
  const sharedAlbums = useMemo(() => albumList.filter((album) => album.isShared), [albumList])

  const openAlbum = (albumId: string) => router.push({ pathname: '/screens/AlbumScreen', params: { albumId } })

  const renderGridAlbum = ({ item }: { item: Album }) => (
    <TouchableOpacity style={styles.gridAlbumItem} activeOpacity={1} onPress={() => openAlbum(item.id)}>
      <View style={styles.albumCoverContainer}>
        <AlbumCover
          coverImage={item.coverImage}
          isShared={item.isShared}
          contributors={item.contributors}
          style={{ width: '100%', height: '100%' }}
          placeholderStyle={{ width: '100%', height: '100%' }}
        />
      </View>
      <Themed.Text style={styles.albumTitle} numberOfLines={1}>
        {item.title}
      </Themed.Text>
      <Themed.Text style={{ fontSize: 13, marginTop: 2 }} text50>
        {item.images.length} photos
      </Themed.Text>
    </TouchableOpacity>
  )

  const renderListAlbum = ({ item }: { item: Album }) => (
    <TouchableOpacity style={styles.listAlbumItem} activeOpacity={1} onPress={() => openAlbum(item.id)}>
      <AlbumCover
        coverImage={item.coverImage}
        isShared={item.isShared}
        contributors={item.contributors}
        style={styles.listAlbumCoverContainer}
        placeholderStyle={{ width: 64, height: 64, borderRadius: 8 }}
      />

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Themed.Text style={styles.albumTitle}>{item.title}</Themed.Text>
        <Themed.Text style={{ fontSize: 13, marginTop: 2 }} text50>
          {item.images.length} photos
        </Themed.Text>
      </View>
      {item.isShared && (
        <View style={styles.listContributorsBadge}>
          <Ionicons name="people" size={16} color="#5271FF" />
          <Text style={styles.listContributorsText}>{item.contributors ?? 0}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
    </TouchableOpacity>
  )

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')} activeOpacity={0.7}>
              <Ionicons name={viewMode === 'grid' ? 'list' : 'grid'} size={24} color={colors.text} />
            </TouchableOpacity>
          )
        }}
      />
      <Themed.ScrollView style={{ padding: 16 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ paddingBottom: 12 }}>
          <TouchableOpacity
            style={[styles.createAlbumButton, { borderColor: colors.borderColor, backgroundColor: colors.secondaryBg }]}
            onPress={() => router.push('/(modal)/CreateAlbumModal')}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={24} color={colors.blue} />
            <Text style={styles.createAlbumText}>Create New Album</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="Your Albums" />

        {viewMode === 'grid' ? (
          <FlatList
            key={'__uniqueList'}
            data={personalAlbums}
            renderItem={renderGridAlbum}
            ListEmptyComponent={
              <EmptyContent
                title="No Albums"
                systemImage="photo.stack"
                actionText="Create new album"
                onAction={() => router.push('/(modal)/CreateAlbumModal')}
              />
            }
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
          />
        ) : (
          <FlatList
            data={personalAlbums}
            renderItem={renderListAlbum}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <EmptyContent
                title="No Albums"
                systemImage="photo.stack"
                actionText="Create new album"
                onAction={() => router.push('/(modal)/CreateAlbumModal')}
              />
            }
            ItemSeparatorComponent={() => <Themed.View type="divider" />}
          />
        )}

        <SectionHeader title="Shared With You" style={{ marginTop: 10 }} />

        {viewMode === 'grid' ? (
          <FlatList
            key={'_uniqueList'}
            data={sharedAlbums}
            renderItem={renderGridAlbum}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            ListEmptyComponent={
              <EmptyContent
                title="No Shared Albums"
                systemImage="rectangle.stack.person.crop"
                actionText="Share one with your friends"
                onAction={() => router.push({ pathname: '/(modal)/CreateAlbumModal', params: { isShared: 'true' } })}
              />
            }
          />
        ) : (
          <FlatList
            data={sharedAlbums}
            renderItem={renderListAlbum}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              <EmptyContent
                title="No Shared Albums"
                systemImage="rectangle.stack.person.crop"
                actionText="Share one with your friends"
                onAction={() => router.push({ pathname: '/(modal)/CreateAlbumModal', params: { isShared: 'true' } })}
              />
            }
            ItemSeparatorComponent={() => <Themed.View type="divider" />}
          />
        )}
      </Themed.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  createAlbumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16
  },
  createAlbumText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 8
  },
  gridAlbumItem: {
    flex: 1,
    margin: 4,
    marginBottom: 16
  },
  albumCoverContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    aspectRatio: 1
  },
  gridAlbumCover: {
    width: '100%',
    height: '100%'
  },
  contributorsBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center'
  },
  contributorsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4
  },
  albumTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 8
  },
  listAlbumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12
  },
  listAlbumCover: {
    width: 64,
    height: 64,
    borderRadius: 8
  },
  listAlbumCoverContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden'
  },
  listContributorsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F5FF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 10
  },
  listContributorsText: {
    color: '#5271FF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4
  }
})

export default AlbumScreen
