import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SectionList } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'

import { Stack } from '@/components/router-form'
import { Themed, TouchableBounce } from '@/components'
import { useTheme, useFriendStore } from '@/hooks'

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
  const { colors } = useTheme()
  const {} = useFriendStore()

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
    <TouchableOpacity style={[styles.friendItem, { backgroundColor: colors.background }]} activeOpacity={0.7}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Themed.Text style={styles.friendName}>{item.name}</Themed.Text>
        <Themed.Text style={{ fontSize: 13 }} text70>
          {item.lastActive}
        </Themed.Text>
      </View>
      <TouchableOpacity style={{ padding: 8 }} activeOpacity={0.7}>
        <Ionicons name="chatbubble-outline" size={24} color="#5271FF" />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  const renderPendingRequestItem = ({ item }) => (
    <Themed.View style={styles.requestItem}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Themed.Text style={styles.friendName}>{item.name}</Themed.Text>
        <Themed.Text style={{ fontSize: 13 }} text70>
          {item.mutualFriends} mutual friends
        </Themed.Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleAcceptRequest(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleDeclineRequest(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </Themed.View>
  )

  const renderSuggestedFriendItem = ({ item }) => (
    <Themed.View style={styles.suggestedItem} shadow>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.suggestedInfo}>
        <Themed.Text style={styles.friendName}>{item.name}</Themed.Text>
        <Themed.Text style={{ fontSize: 13 }} text70>
          {item.mutualFriends} mutual friends
        </Themed.Text>
      </View>
      <TouchableBounce style={styles.addButton} onPress={() => handleAddSuggested(item.id)}>
        <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
      </TouchableBounce>
    </Themed.View>
  )

  const renderSectionHeader = ({ section }) => (
    <Themed.View style={styles.sectionHeader} type="secondary">
      <Themed.Text style={styles.sectionTitle}>{section.title}</Themed.Text>
      {section.count > 0 && <Text style={styles.sectionCount}>{section.count}</Text>}
    </Themed.View>
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
          ItemSeparatorComponent={() => <Themed.View type="divider" />}
        />
      )
    },
    {
      title: 'Your Friends',
      data: [{ type: 'friends' }],
      renderItem: () => (
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <Themed.View type="divider" />}
        />
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
    <Themed.View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerLargeTitle: false,
          headerTransparent: false,
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
    </Themed.View>
  )
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 100
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600'
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
    paddingVertical: 12
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
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
    paddingVertical: 12
  },
  suggestedItem: {
    width: 150,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  }
})

export default FriendsScreen
