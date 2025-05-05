/**
 * Screen Params:
 * friendID: string
 */
import { useState, useMemo } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native'
import { Ionicons, Feather, AntDesign } from '@expo/vector-icons'
import { useLocalSearchParams } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'

import { Themed, SectionHeader } from '@/components'
import { Stack, ContentUnavailable } from '@/components/router-form'
import { useFriendStore } from '@/hooks'

const { width } = Dimensions.get('window')
const PHOTO_SIZE = (width - 48) / 3

const FriendProfileModal = () => {
  const { friends } = useFriendStore()
  const { friendID } = useLocalSearchParams<{ friendID: string }>()
  const friend = friends.find((f) => f.id === friendID)!

  const [isFriend, setIsFriend] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  // Sample data for the profile
  const user = {
    bio: 'Photography enthusiast | Travel lover | Coffee addict',
    postsCount: 127,
    friendsCount: 348,
    albumsCount: 15,
    recentPhotos: [
      // your original four
      { id: '1', imageUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131' },
      { id: '2', imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e' },
      { id: '3', imageUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5' },
      { id: '4', imageUrl: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e' },
      // now 100 more, ids 5…104
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 5}`,
        imageUrl: `https://picsum.photos/${100 + i * 5}/${200 + i * 5}`
      }))
    ],
    sharedAlbums: [
      {
        id: '1',
        name: 'Summer Trip 2024',
        count: 34,
        coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
      },
      {
        id: '2',
        name: 'Food Adventures',
        count: 27,
        coverUrl: 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327'
      },
      {
        id: '3',
        name: 'City Explorations',
        count: 42,
        coverUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b'
      }
    ]
  }

  // pick a random subset of 6-9 photos once on mount
  const displayedPhotos = useMemo(() => {
    // shuffle copy
    const shuffled = [...user.recentPhotos].sort(() => Math.random() - 0.5)
    // pick random count between 6 and 9
    const count = Math.floor(Math.random() * 4) + 6
    return shuffled.slice(0, count)
  }, [user.recentPhotos])

  // Function to toggle friend status (for demo purposes)
  const toggleFriendStatus = () => {
    setIsFriend(!isFriend)
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
    <TouchableOpacity style={styles.albumCard} activeOpacity={0.8}>
      <Image source={{ uri: item.coverUrl }} style={styles.albumCover} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.albumGradient} />
      <View style={styles.albumInfo}>
        <Text style={styles.albumName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.albumCountContainer}>
          <Ionicons name="images-outline" size={14} color="#FFFFFF" />
          <Text style={styles.albumCount}>{item.count}</Text>
        </View>
      </View>
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
            <Themed.Text style={styles.userName}>{friend.name}</Themed.Text>
            <Themed.Text style={styles.userHandle} text70>
              @username
            </Themed.Text>
            <Themed.Text style={styles.lastActive}>127 posts • Active {friend.lastActive}</Themed.Text>
          </View>
        </View>

        {/* Bio section */}
        <View style={{ paddingHorizontal: 16 }}>
          <Themed.Text style={styles.bioText}>{user.bio}</Themed.Text>
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

        {isFriend ? (
          <>
            {/* Recent photos section */}
            <View style={styles.sectionContainer}>
              <SectionHeader title="Recent Photos" />

              <View style={styles.photoGrid}>
                {displayedPhotos.slice(0, 6).map((photo, index) => (
                  <TouchableOpacity
                    key={photo.id}
                    style={styles.photoGridItem}
                    activeOpacity={0.8}
                    onPress={() => setSelectedPhoto(photo)}
                  >
                    <Image source={{ uri: photo.imageUrl }} style={styles.photoGridThumbnail} />
                    {index === 5 && displayedPhotos.length > 6 && (
                      <View style={styles.morePhotosOverlay}>
                        <Text style={styles.morePhotosText}>+{displayedPhotos.length - 6}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Shared albums section */}
            <View style={[styles.sectionContainer, { paddingTop: 0 }]}>
              <SectionHeader title="Shared Albums" />

              <FlatList
                data={user.sharedAlbums}
                renderItem={renderAlbumItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 60, marginBottom: 60 }}
                snapToInterval={width * 0.7 + 12}
                decelerationRate="fast"
              />
            </View>
          </>
        ) : (
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
    marginBottom: 2
  },
  userHandle: {
    fontSize: 14,
    marginBottom: 8
  },
  lastActive: {
    fontSize: 13,
    color: '#888888'
  },
  bioText: {
    fontSize: 14,
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
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 0.48,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3
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
    borderRadius: 20,
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
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3
  },
  addFriendButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8
  },

  // New styles for enhanced design
  sectionContainer: {
    padding: 16
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  viewAllText: {
    fontSize: 14,
    color: '#4A90E2',
    marginRight: 4
  },

  // Photo Grid Styles
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4
  },
  photoGridItem: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    margin: 4,
    borderRadius: 12,
    overflow: 'hidden'
  },
  photoGridThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0'
  },
  morePhotosOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  morePhotosText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700'
  },

  // Album Styles
  albumsList: {
    paddingRight: 16
  },
  albumCard: {
    width: width * 0.7,
    height: 180,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5
  },
  albumCover: {
    width: '100%',
    height: '100%'
  },
  albumGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%'
  },
  albumInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16
  },
  albumName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  albumCountContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  albumCount: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  }
})

export default FriendProfileModal
