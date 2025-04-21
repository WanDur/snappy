import { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SectionList } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as Crypto from 'expo-crypto'
import { router } from 'expo-router'

import { Stack } from '@/components/router-form'
import { Themed, TouchableBounce } from '@/components'
import { useTheme, useFriendStore } from '@/hooks'
import { Friend } from '@/types'

const generateUser = (type: 'friend' | 'pending' | 'suggested') => {
  const names = [
    'Sara Johnson',
    'Mike Chen',
    'Emma Wilson',
    'David Park',
    'Olivia Martinez',
    'James Wilson',
    'Lily Chen',
    'Alex Thompson',
    'Sophie Miller',
    'Ryan Garcia',
    'Chris Lee',
    'Zoe Kim',
    'Ethan Nguyen',
    'Ava Patel',
    'Leo Jackson'
  ]

  const gender = Math.random() < 0.5 ? 'men' : 'women'
  const avatarId = Math.floor(Math.random() * 99) + 1
  const avatar = `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`
  const id = Crypto.randomUUID()
  const name = names[Math.floor(Math.random() * names.length)]

  const item = { id, name, avatar, type } as Friend
  const lastActiveOptions = ['Just now', '2h ago', '4h ago', '1d ago', '3d ago']
  item.lastActive = lastActiveOptions[Math.floor(Math.random() * lastActiveOptions.length)]
  item.mutualFriends = Math.floor(Math.random() * 10)

  return item
}

const FriendsScreen = () => {
  const { colors } = useTheme()
  const { friends, addFriend, handleRequest } = useFriendStore()

  const [query, setQuery] = useState('')

  const myFriend = friends.filter((f) => f.type === 'friend')
  const pendingRequests = friends.filter((f) => f.type === 'pending')
  const suggestedFriends = friends.filter((f) => f.type === 'suggested')

  const handleAddSuggested = (id: string) => {
    // In a real app, this would send a friend request
    // For demo, just remove from suggestions
    // setSuggestedFriends(suggestedFriends.filter((friend) => friend.id !== id))
  }

  const openUserProfile = (id: string) => {
    router.push({ pathname: '/(modal)/FriendProfileModal', params: { friendID: id } })
  }

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      style={[styles.friendItem, { backgroundColor: colors.background }]}
      activeOpacity={0.7}
      onPress={() => openUserProfile(item.id)}
    >
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

  const renderPendingRequestItem = ({ item }: { item: Friend }) => (
    <Themed.View style={styles.requestItem}>
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
        activeOpacity={0.7}
        onPress={() => openUserProfile(item.id)}
      >
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Themed.Text style={styles.friendName}>{item.name}</Themed.Text>
          <Themed.Text style={{ fontSize: 13 }} text70>
            {item.mutualFriends} mutual friends
          </Themed.Text>
        </View>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleRequest(item.id, true)}
          activeOpacity={0.7}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleRequest(item.id, false)}
          activeOpacity={0.7}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </Themed.View>
  )

  const renderSuggestedFriendItem = ({ item }: { item: Friend }) => (
    <Themed.View style={styles.suggestedItem} shadow>
      <TouchableOpacity style={{ alignItems: 'center' }} activeOpacity={0.7} onPress={() => openUserProfile(item.id)}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.suggestedInfo}>
          <Themed.Text style={styles.friendName}>{item.name}</Themed.Text>
          <Themed.Text style={{ fontSize: 13 }} text70>
            {item.mutualFriends} mutual friends
          </Themed.Text>
        </View>
      </TouchableOpacity>
      <TouchableBounce style={styles.addButton} onPress={() => handleAddSuggested(item.id)}>
        <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
      </TouchableBounce>
    </Themed.View>
  )

  const renderSectionHeader = ({ section }) => (
    <Themed.View style={styles.sectionHeader} type="secondary">
      <Themed.Text style={styles.sectionTitle}>{section.title}</Themed.Text>
      {section.count > 0 && <Text style={styles.sectionCount}>{section.count}</Text>}
      <TouchableOpacity
        style={{ marginLeft: 10 }}
        onPress={() => {
          const sectionTitle: string = section.title.toLowerCase()
          if (sectionTitle.includes('requests')) {
            addFriend(generateUser('pending'))
          } else if (sectionTitle.includes('your')) {
            addFriend(generateUser('friend'))
          } else if (sectionTitle.includes('suggested')) {
            addFriend(generateUser('suggested'))
          }
        }}
      >
        <Text>$add</Text>
      </TouchableOpacity>
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
          data={myFriend}
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
