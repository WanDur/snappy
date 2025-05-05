/**
 * Screen Params:
 * friendID: string
 */
import { useState } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native'
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'

import { Themed } from '@/components'
import { Stack, ContentUnavailable } from '@/components/router-form'
import { useFriendStore } from '@/hooks'

const FriendProfileModal = () => {
  const { friends } = useFriendStore()
  const { friendID } = useLocalSearchParams<{ friendID: string }>()
  const friend = friends.find((f) => f.id === friendID)!

  const [isFriend, setIsFriend] = useState(true)

  // Sample data for the profile
  const user = {
    bio: 'Photography enthusiast | Travel lover | Coffee addict',
    postsCount: 127,
    friendsCount: 348,
    albumsCount: 15,
    recentPhotos: [
      { id: '1', imageUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131' },
      { id: '2', imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e' },
      { id: '3', imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5' },
      { id: '4', imageUrl: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e' }
    ],
    sharedAlbums: [
      { id: '1', name: 'Summer Trip 2024', count: 34 },
      { id: '2', name: 'Food Adventures', count: 27 }
    ]
  }

  // Function to toggle friend status (for demo purposes)
  const toggleFriendStatus = () => {
    setIsFriend(!isFriend)
  }

  // Function to handle viewing all photos
  const handleViewAllPhotos = () => {
    console.log('Navigate to all photos view')
    // Navigation logic here
  }

  // Function to handle viewing all albums
  const handleViewAllAlbums = () => {
    console.log('Navigate to all albums view')
    // Navigation logic here
  }

  // Function to handle adding friend
  const handleAddFriend = () => {
    console.log('Send friend request')
    // Friend request logic here
    setIsFriend(true)
  }

  // Function to handle removing friend
  const handleRemoveFriend = () => {
    console.log('Remove friend')
    // Remove friend logic here
    setIsFriend(false)
  }

  // Function to handle messaging friend
  const handleMessage = () => {
    console.log('Navigate to messages with this friend')
    // Navigation logic here
  }

  // Render album item
  const renderAlbumItem = ({ item }) => (
    <TouchableOpacity style={styles.albumItem}>
      <View style={styles.albumIconContainer}>
        <MaterialCommunityIcons name="album" size={24} color="#4A90E2" />
        <Text style={styles.albumCount}>{item.count}</Text>
      </View>
      <Text style={styles.albumName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  )

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerTitle: 'User Profile' }} />
      <Themed.ScrollView style={{ flex: 1 }}>
        {/* Profile section */}
        <View style={styles.profileSection}>
          <Image source={{ uri: friend.avatar }} style={styles.profilePic} />

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{friend.name}</Text>
            <Text style={styles.userHandle}>@username</Text>
            <Text style={[styles.userHandle, { marginBottom: 4 }]}>127 posts</Text>
            <Text style={styles.lastActive}>Active {friend.lastActive}</Text>
          </View>
        </View>

        {/* Bio section */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={styles.bioText}>{user.bio}</Text>
        </View>

        <View style={styles.actionSection}>
          {isFriend ? (
            <>
              <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
                <Ionicons name="chatbubble-outline" size={18} color="#FFFFFF" />
                <Text style={styles.messageButtonText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.unfriendButton} onPress={handleRemoveFriend}>
                <Feather name="user-x" size={18} color="#FF6B6B" />
                <Text style={styles.unfriendButtonText}>Unfriend</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.addFriendButton} onPress={handleAddFriend}>
              <Feather name="user-plus" size={18} color="#FFFFFF" />
              <Text style={styles.addFriendButtonText}>Add Friend</Text>
            </TouchableOpacity>
          )}
        </View>

        <Themed.View type="divider" />

        {isFriend && (
          <>
            {/* Recent photos section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Photos</Text>
                <TouchableOpacity onPress={handleViewAllPhotos}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={user.recentPhotos}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.photoItem}>
                    <Image source={{ uri: item.imageUrl }} style={styles.photoThumbnail} />
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photosContainer}
              />
            </View>

            {/* Shared albums section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Shared Albums</Text>
                <TouchableOpacity onPress={handleViewAllAlbums}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={user.sharedAlbums}
                renderItem={renderAlbumItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.albumsContainer}
              />
            </View>
          </>
        )}

        {!isFriend && (
          <View style={{ padding: 16 }}>
            <ContentUnavailable
              title="Private Content"
              systemImage="lock.circle"
              description="Send a friend request to view this user's photos and albums"
            />
          </View>
        )}
      </Themed.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  profileSection: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center'
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0'
  },
  userInfo: {
    marginLeft: 16,
    flex: 1
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 2
  },
  userHandle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 6
  },
  lastActive: {
    fontSize: 12,
    color: '#888888'
  },
  bioText: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20
  },
  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: 'space-between'
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 0.48
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8
  },
  unfriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 0.48
  },
  unfriendButtonText: {
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 8
  },
  addFriendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1
  },
  addFriendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8
  },
  sectionContainer: {
    paddingVertical: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333'
  },
  viewAllText: {
    fontSize: 14,
    color: '#4A90E2'
  },
  photosContainer: {
    paddingHorizontal: 12
  },
  photoItem: {
    marginHorizontal: 4,
    borderRadius: 8,
    overflow: 'hidden'
  },
  photoThumbnail: {
    width: 120,
    height: 120,
    backgroundColor: '#F0F0F0'
  },
  albumsContainer: {
    paddingHorizontal: 12
  },
  albumItem: {
    width: 100,
    marginHorizontal: 4,
    alignItems: 'center'
  },
  albumIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6
  },
  albumCount: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#333333'
  },
  albumName: {
    fontSize: 12,
    color: '#555555',
    textAlign: 'center'
  }
})

export default FriendProfileModal
