import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SectionList } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'

import { Stack } from '@/components/router-form'
import { Themed } from '@/components'

// Mock data for demonstration
const FRIENDS_DATA = [
  {
    id: 'f1',
    name: 'Sara Johnson',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    lastActive: '2h ago'
  },
  {
    id: 'f2',
    name: 'Mike Chen',
    avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
    lastActive: '4h ago'
  },
  {
    id: 'f3',
    name: 'Emma Wilson',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
    lastActive: '1d ago'
  },
  {
    id: 'f4',
    name: 'David Park',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    lastActive: '3d ago'
  },
  {
    id: 'f5',
    name: 'Olivia Martinez',
    avatar: 'https://randomuser.me/api/portraits/women/55.jpg',
    lastActive: 'Just now'
  }
]

const PENDING_REQUESTS = [
  {
    id: 'p1',
    name: 'James Wilson',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    mutualFriends: 3
  },
  {
    id: 'p2',
    name: 'Lily Chen',
    avatar: 'https://randomuser.me/api/portraits/women/72.jpg',
    mutualFriends: 5
  }
]

const SUGGESTED_FRIENDS = [
  {
    id: 's1',
    name: 'Alex Thompson',
    avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
    mutualFriends: 8
  },
  {
    id: 's2',
    name: 'Sophie Miller',
    avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
    mutualFriends: 4
  },
  {
    id: 's3',
    name: 'Ryan Garcia',
    avatar: 'https://randomuser.me/api/portraits/men/77.jpg',
    mutualFriends: 2
  }
]

const FriendsScreen = () => {
  const [query, setQuery] = useState('')
  const [pendingRequests, setPendingRequests] = useState(PENDING_REQUESTS)
  const [suggestedFriends, setSuggestedFriends] = useState(SUGGESTED_FRIENDS)
  const [friends, setFriends] = useState(FRIENDS_DATA)

  const handleAcceptRequest = (id: string) => {
    // Find the request
    const requestToAccept = pendingRequests.find((request) => request.id === id)

    if (requestToAccept) {
      // Remove from pending
      setPendingRequests(pendingRequests.filter((request) => request.id !== id))

      // Add to friends
      setFriends([
        ...friends,
        {
          id: requestToAccept.id,
          name: requestToAccept.name,
          avatar: requestToAccept.avatar,
          lastActive: 'Just now'
        }
      ])
    }
  }

  const handleDeclineRequest = (id: string) => {
    setPendingRequests(pendingRequests.filter((request) => request.id !== id))
  }

  const handleAddSuggested = (id: string) => {
    // In a real app, this would send a friend request
    // For demo, just remove from suggestions
    setSuggestedFriends(suggestedFriends.filter((friend) => friend.id !== id))
  }

  const renderFriendItem = ({ item }) => (
    <TouchableOpacity style={styles.friendItem}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.lastActive}>{item.lastActive}</Text>
      </View>
      <TouchableOpacity style={styles.messageButton}>
        <Ionicons name="chatbubble-outline" size={20} color="#5271FF" />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  const renderPendingRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.requestInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.mutualFriends}>{item.mutualFriends} mutual friends</Text>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptRequest(item.id)}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleDeclineRequest(item.id)}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderSuggestedFriendItem = ({ item }) => (
    <View style={styles.suggestedItem}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.suggestedInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.mutualFriends}>{item.mutualFriends} mutual friends</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={() => handleAddSuggested(item.id)}>
        <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  )

  const renderSectionHeader = ({ section }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.count > 0 && <Text style={styles.sectionCount}>{section.count}</Text>}
    </View>
  )

  const onSearch = () => {}

  const sections = [
    {
      title: 'Friend Requests',
      data: pendingRequests.length > 0 ? [{ type: 'requests' }] : [],
      count: pendingRequests.length,
      renderItem: () => (
        <FlatList
          data={pendingRequests}
          renderItem={renderPendingRequestItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      )
    },
    {
      title: 'Your Friends',
      data: [{ type: 'friends' }],
      renderItem: () => (
        <FlatList data={friends} renderItem={renderFriendItem} keyExtractor={(item) => item.id} scrollEnabled={false} />
      )
    },
    {
      title: 'Suggested Friends',
      data: suggestedFriends.length > 0 ? [{ type: 'suggested' }] : [],
      renderItem: () => (
        <FlatList
          data={suggestedFriends}
          renderItem={renderSuggestedFriendItem}
          keyExtractor={(item) => item.id}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestedList}
        />
      )
    }
  ]

  return (
    <>
      <Stack.Screen
        options={{
          headerSearchBarOptions: {
            placeholder: 'Search',
            autoFocus: true,
            hideWhenScrolling: false,
            onChangeText: (e) => {
              setQuery(e.nativeEvent.text)
            },
            onSearchButtonPress: () => {
              onSearch()
            }
          }
        }}
      />

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.type + index}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 16,
    color: '#333'
  },
  clearButton: {
    padding: 4
  },
  listContainer: {
    paddingBottom: 100
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F8F8'
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333'
  },
  sectionCount: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#5271FF'
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2
  },
  lastActive: {
    fontSize: 13,
    color: '#888'
  },
  messageButton: {
    padding: 8
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12
  },
  mutualFriends: {
    fontSize: 13,
    color: '#666'
  },
  requestActions: {
    flexDirection: 'row'
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8
  },
  acceptButton: {
    backgroundColor: '#5271FF'
  },
  declineButton: {
    backgroundColor: '#EFEFEF'
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500'
  },
  declineButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500'
  },
  suggestedList: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8
  },
  suggestedItem: {
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1
  },
  suggestedInfo: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8
  },
  addButton: {
    backgroundColor: '#5271FF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default FriendsScreen
