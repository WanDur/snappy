import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'

import { useAlbumStore, useTheme } from '@/hooks'
import { Themed, SectionHeader } from '@/components'
import { Album } from '@/types'
import { Form, Stack, ContentUnavailable } from '@/components/router-form'

const AlbumScreen = () => {
  const router = useRouter()
  const { albumList, addAlbum } = useAlbumStore()
  const { colors } = useTheme()

  const personalAlbums = albumList.filter((album) => !album.isShared)
  const sharedAlbums = albumList.filter((album) => album.isShared)

  const [viewMode, setViewMode] = useState('grid')
  const [newAlbumTitle, setNewAlbumTitle] = useState('')

  const renderGridAlbum = ({ item }: { item: Album }) => (
    <TouchableOpacity
      style={styles.gridAlbumItem}
      activeOpacity={1}
      onPress={() => router.push({ pathname: '/screens/AlbumScreen', params: { albumId: item.id } })}
    >
      <View style={styles.albumCoverContainer}>
        {item.coverImage === '' ? (
          <Themed.View
            type="secondary"
            style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="image" size={64} color={colors.borderColor} />
          </Themed.View>
        ) : (
          <Image source={{ uri: item.coverImage }} style={styles.gridAlbumCover} />
        )}

        {item.isShared && (
          <View style={styles.contributorsBadge}>
            <Ionicons name="people" size={14} color="#FFFFFF" />
            <Text style={styles.contributorsText}>{item.contributors ?? 0}</Text>
          </View>
        )}
      </View>
      <Text style={styles.albumTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.photoCount}>{item.images.length} photos</Text>
    </TouchableOpacity>
  )

  const renderListAlbum = ({ item }: { item: Album }) => (
    <TouchableOpacity
      style={styles.listAlbumItem}
      activeOpacity={1}
      onPress={() => router.push({ pathname: '/screens/AlbumScreen', params: { albumId: item.id } })}
    >
      {item.coverImage === '' ? (
        <Themed.View
          type="secondary"
          style={{ width: 64, height: 64, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="image" size={30} color={colors.borderColor} />
        </Themed.View>
      ) : (
        <Image source={{ uri: item.coverImage }} style={styles.listAlbumCover} />
      )}

      <View style={styles.listAlbumInfo}>
        <Text style={styles.albumTitle}>{item.title}</Text>
        <Text style={styles.listPhotoCount}>{item.images.length} photos</Text>
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
            <TouchableOpacity
              style={styles.viewToggle}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              activeOpacity={0.7}
            >
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
            ListEmptyComponent={() => (
              <Form.Section style={{ marginHorizontal: -16 }}>
                <ContentUnavailable
                  title="No Albums"
                  systemImage="photo.stack"
                  actions={
                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(modal)/CreateAlbumModal')}>
                      <Themed.Text type="link">Create new album</Themed.Text>
                    </TouchableOpacity>
                  }
                />
              </Form.Section>
            )}
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
            ListEmptyComponent={() => (
              <Form.Section style={{ marginHorizontal: -16 }}>
                <ContentUnavailable
                  title="No Albums"
                  systemImage="photo.stack"
                  actions={
                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(modal)/CreateAlbumModal')}>
                      <Themed.Text type="link">Create new album</Themed.Text>
                    </TouchableOpacity>
                  }
                />
              </Form.Section>
            )}
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
            ListEmptyComponent={() => (
              <Form.Section style={{ marginHorizontal: -16 }}>
                <ContentUnavailable
                  title="No Shared Albums"
                  systemImage="rectangle.stack.person.crop"
                  actions={
                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(modal)/CreateAlbumModal')}>
                      <Themed.Text type="link">Share one with your friends</Themed.Text>
                    </TouchableOpacity>
                  }
                />
              </Form.Section>
            )}
          />
        ) : (
          <FlatList
            data={sharedAlbums}
            renderItem={renderListAlbum}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListEmptyComponent={() => (
              <Form.Section style={{ marginHorizontal: -16 }}>
                <ContentUnavailable
                  title="No Shared Albums"
                  systemImage="rectangle.stack.person.crop"
                  actions={
                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(modal)/CreateAlbumModal')}>
                      <Themed.Text type="link">Share one with your friends</Themed.Text>
                    </TouchableOpacity>
                  }
                />
              </Form.Section>
            )}
          />
        )}
      </Themed.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    backgroundColor: '#FFFFFF'
  },
  viewToggle: {
    padding: 8
  },
  listContainer: {
    paddingBottom: 100
  },
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
    color: '#333',
    marginTop: 8
  },
  photoCount: {
    fontSize: 13,
    color: '#888',
    marginTop: 2
  },
  listAlbumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  listAlbumCover: {
    width: 64,
    height: 64,
    borderRadius: 8
  },
  listAlbumInfo: {
    flex: 1,
    marginLeft: 12
  },
  listPhotoCount: {
    fontSize: 13,
    color: '#888',
    marginTop: 2
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
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  albumTitleInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20
  },
  createButton: {
    backgroundColor: '#5271FF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  }
})

export default AlbumScreen
