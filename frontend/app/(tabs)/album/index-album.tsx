import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'

import { Stack } from '@/components/router-form'
import { Themed } from '@/components'

// Mock data for demonstration
const PERSONAL_ALBUMS = [
  {
    id: 'a1',
    title: 'Summer Trip',
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    photoCount: 24,
    isShared: false
  },
  {
    id: 'a2',
    title: 'Family',
    coverImage: 'https://images.unsplash.com/photo-1511895426328-dc8714191300',
    photoCount: 56,
    isShared: false
  },
  {
    id: 'a3',
    title: 'Food Adventures',
    coverImage: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929',
    photoCount: 18,
    isShared: false
  },
  {
    id: 'a4',
    title: 'Pets',
    coverImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e',
    photoCount: 15,
    isShared: false
  }
]

const SHARED_ALBUMS = [
  {
    id: 's1',
    title: 'Group Trip 2024',
    coverImage: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60',
    photoCount: 87,
    contributors: 5,
    isShared: true
  },
  {
    id: 's2',
    title: 'Concert Night',
    coverImage: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4',
    photoCount: 32,
    contributors: 3,
    isShared: true
  },
  {
    id: 's3',
    title: 'Office Party',
    coverImage: 'https://images.unsplash.com/photo-1516992654410-9309d4587e94',
    photoCount: 41,
    contributors: 8,
    isShared: true
  }
]

const AlbumScreen = () => {
  const [viewMode, setViewMode] = useState('grid')
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [newAlbumTitle, setNewAlbumTitle] = useState('')
  const [personalAlbums, setPersonalAlbums] = useState(PERSONAL_ALBUMS)
  const [sharedAlbums, setSharedAlbums] = useState(SHARED_ALBUMS)

  const handleCreateAlbum = () => {
    if (newAlbumTitle.trim()) {
      const newAlbum = {
        id: `a${Date.now()}`, // Simple unique ID for demo
        title: newAlbumTitle,
        coverImage: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0', // Default cover
        photoCount: 0,
        isShared: false
      }

      setPersonalAlbums([newAlbum, ...personalAlbums])
      setNewAlbumTitle('')
      setCreateModalVisible(false)
    }
  }

  const renderGridAlbum = ({ item }) => (
    <TouchableOpacity style={styles.gridAlbumItem}>
      <View style={styles.albumCoverContainer}>
        <Image source={{ uri: item.coverImage }} style={styles.gridAlbumCover} />
        {item.isShared && (
          <View style={styles.contributorsBadge}>
            <Ionicons name="people" size={14} color="#FFFFFF" />
            <Text style={styles.contributorsText}>{item.contributors}</Text>
          </View>
        )}
      </View>
      <Text style={styles.albumTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.photoCount}>{item.photoCount} photos</Text>
    </TouchableOpacity>
  )

  const renderListAlbum = ({ item }) => (
    <TouchableOpacity style={styles.listAlbumItem}>
      <Image source={{ uri: item.coverImage }} style={styles.listAlbumCover} />
      <View style={styles.listAlbumInfo}>
        <Text style={styles.albumTitle}>{item.title}</Text>
        <Text style={styles.listPhotoCount}>{item.photoCount} photos</Text>
      </View>
      {item.isShared && (
        <View style={styles.listContributorsBadge}>
          <Ionicons name="people" size={16} color="#5271FF" />
          <Text style={styles.listContributorsText}>{item.contributors}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
    </TouchableOpacity>
  )

  const renderSectionHeader = (title) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  )

  const renderCreateAlbumModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={createModalVisible}
      onRequestClose={() => setCreateModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Album</Text>
            <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.albumTitleInput}
            placeholder="Album Title"
            value={newAlbumTitle}
            onChangeText={setNewAlbumTitle}
            autoFocus
          />

          <TouchableOpacity style={styles.createButton} onPress={handleCreateAlbum}>
            <Text style={styles.createButtonText}>Create Album</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity
              style={styles.viewToggle}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              <Ionicons name={viewMode === 'grid' ? 'list' : 'grid'} size={24} color="#333" />
            </TouchableOpacity>
          )
        }}
      />
      <Themed.ScrollView style={{ padding: 16 }}>
        <FlatList
          data={[]}
          ListHeaderComponent={() => (
            <>
              <View>
                <TouchableOpacity style={styles.createAlbumButton} onPress={() => setCreateModalVisible(true)}>
                  <Ionicons name="add-circle" size={24} color="#5271FF" />
                  <Text style={styles.createAlbumText}>Create New Album</Text>
                </TouchableOpacity>
              </View>

              {renderSectionHeader('Your Albums')}

              {viewMode === 'grid' ? (
                <FlatList
                  data={personalAlbums}
                  renderItem={renderGridAlbum}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  scrollEnabled={false}
                  contentContainerStyle={styles.gridContainer}
                />
              ) : (
                <FlatList
                  data={personalAlbums}
                  renderItem={renderListAlbum}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}

              {renderSectionHeader('Shared With You')}

              {viewMode === 'grid' ? (
                <FlatList
                  data={sharedAlbums}
                  renderItem={renderGridAlbum}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  scrollEnabled={false}
                  contentContainerStyle={styles.gridContainer}
                />
              ) : (
                <FlatList
                  data={sharedAlbums}
                  renderItem={renderListAlbum}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </>
          )}
          contentContainerStyle={styles.listContainer}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        />

        {renderCreateAlbumModal()}
      </Themed.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  viewToggle: {
    padding: 8
  },
  listContainer: {
    paddingBottom: 100
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333'
  },
  createAlbumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16
  },
  createAlbumText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5271FF',
    marginLeft: 8
  },
  gridContainer: {
    paddingHorizontal: 12
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
