import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'

import { Stack } from '@/components/router-form'

// Mock data for demonstration
const MOCK_POSTS = [
  {
    id: '1',
    username: 'Alex Morgan',
    userAvatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b',
    likes: 42,
    comments: 5,
    timestamp: '2h ago'
  },
  {
    id: '2',
    username: 'Jamie Smith',
    userAvatar: 'https://randomuser.me/api/portraits/men/44.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1523531294919-4bcd7c65e216',
    likes: 26,
    comments: 3,
    timestamp: '4h ago'
  },
  {
    id: '3',
    username: 'Taylor Reed',
    userAvatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1576506542790-51244b486a6b',
    likes: 89,
    comments: 12,
    timestamp: '6h ago'
  },
  {
    id: '4',
    username: 'Alex Morgan',
    userAvatar: 'https://randomuser.me/api/portraits/women/32.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2',
    likes: 34,
    comments: 2,
    timestamp: '1d ago'
  }
]

const HomeScreen = () => {
  const [hasPostedThisWeek, setHasPostedThisWeek] = useState(false)
  const [likedPosts, setLikedPosts] = useState({})

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }

  const renderUploadReminder = () => {
    if (!hasPostedThisWeek) {
      return (
        <View style={styles.reminderContainer}>
          <View style={styles.reminderContent}>
            <Ionicons name="camera" size={24} color="#ffffff" style={styles.reminderIcon} />
            <Text style={styles.reminderText}>Share a photo this week to see your friends' posts!</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={() => setHasPostedThisWeek(true)}>
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
    return null
  }

  const renderPostItem = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
          <Text style={styles.username}>{item.username}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <Image source={{ uri: item.imageUrl }} style={styles.postImage} contentFit="cover" />

      <View style={styles.postActions}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => toggleLike(item.id)}>
            <Ionicons
              name={likedPosts[item.id] ? 'heart' : 'heart-outline'}
              size={24}
              color={likedPosts[item.id] ? '#FF3B30' : '#333'}
            />
            <Text style={styles.actionText}>{likedPosts[item.id] ? item.likes + 1 : item.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={22} color="#333" />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
    </View>
  )

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <TouchableOpacity activeOpacity={0.7}>
              <Ionicons name="notifications-outline" size={26} />
            </TouchableOpacity>
          )
        }}
      />
      <FlatList
        data={MOCK_POSTS}
        keyExtractor={(item) => item.id}
        renderItem={renderPostItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContainer}
        ListHeaderComponent={renderUploadReminder}
        contentInsetAdjustmentBehavior="automatic"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8'
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
  feedContainer: {
    paddingTop: 16,
    paddingBottom: 100
  },
  reminderContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#5271FF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  reminderIcon: {
    marginRight: 12
  },
  reminderText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500'
  },
  uploadButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  uploadButtonText: {
    color: '#5271FF',
    fontWeight: '600',
    fontSize: 14
  },
  postContainer: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    marginHorizontal: 16
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333'
  },
  postImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#EFEFEF'
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333'
  },
  timestamp: {
    fontSize: 13,
    color: '#888'
  }
})

export default HomeScreen
