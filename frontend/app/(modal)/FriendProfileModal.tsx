import { useState } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native'
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'

import { Themed } from '@/components'
import { Stack } from '@/components/router-form'
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

  // Render photo item
  const renderPhotoItem = ({ item }) => (
    <TouchableOpacity style={styles.photoItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.photoThumbnail} />
    </TouchableOpacity>
  )

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
      <Themed.ScrollView style={styles.scrollContainer}>
        {/* Profile section */}
        <View style={styles.profileSection}>
          <Image source={{ uri: friend.avatar }} style={styles.profilePic} />

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{friend.name}</Text>
            <Text style={styles.userHandle}>@username</Text>

            <View style={styles.streakContainer}>
              <Ionicons name="flame" size={16} color="#FF6B6B" />
              <Text style={styles.streakText}>`streak` day streak</Text>
            </View>

            <Text style={styles.lastActive}>Active {friend.lastActive}</Text>
          </View>
        </View>

        {/* Bio section */}
        <View style={styles.bioSection}>
          <Text style={styles.bioText}>{user.bio}</Text>
        </View>

        {/* Stats section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.postsCount}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.friendsCount}</Text>
            <Text style={styles.statLabel}>Friends</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.albumsCount}</Text>
            <Text style={styles.statLabel}>Albums</Text>
          </View>
        </View>

        {/* Action buttons (different based on friend status) */}
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
                renderItem={renderPhotoItem}
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
          <View style={styles.nonFriendMessage}>
            <Ionicons name="lock-closed" size={40} color="#AAAAAA" />
            <Text style={styles.nonFriendTitle}>Content is private</Text>
            <Text style={styles.nonFriendText}>Send a friend request to view this user's photos and shared albums</Text>
          </View>
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
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  closeButton: {
    padding: 4
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333'
  },
  headerRightPlaceholder: {
    width: 28
  },
  scrollContainer: {
    flex: 1
  },
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
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  streakText: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 4
  },
  lastActive: {
    fontSize: 12,
    color: '#888888'
  },
  bioSection: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  bioText: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20
  },
  statsSection: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'space-around'
  },
  statItem: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333'
  },
  statLabel: {
    fontSize: 12,
    color: '#777777',
    marginTop: 2
  },
  statDivider: {
    width: 1,
    backgroundColor: '#EEEEEE'
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
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0'
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
  },
  nonFriendMessage: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  nonFriendTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#555555',
    marginTop: 16,
    marginBottom: 8
  },
  nonFriendText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 20
  }
})

export default FriendProfileModal
