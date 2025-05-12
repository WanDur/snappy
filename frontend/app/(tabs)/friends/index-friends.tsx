import { useState, useEffect } from 'react'
import { Text, View, TouchableOpacity, TouchableHighlight, ActivityIndicator, StyleSheet, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import * as Crypto from 'expo-crypto'
import { router, useRouter } from 'expo-router'
import Animated, { LinearTransition } from 'react-native-reanimated'

import { Themed, TouchableBounce, SectionHeader, SwipeableRow } from '@/components'
import { Form, Stack, ContentUnavailable } from '@/components/router-form'
import { HeaderText } from '@/components/ui'
import { useTheme, useFriendStore, useChatStore } from '@/hooks'
import { Friend } from '@/types'
import { bypassLogin, isAuthenticated, parsePublicUrl, useSession } from '@/contexts/auth'
import { FriendResponse, FriendStatus } from '@/types/friend.types'
import { set } from 'zod'
import { useSync } from '@/hooks/useSync'

const generateUser = (type: FriendStatus) => {
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
  const username = name.toLowerCase().replace(/\s+/g, '').slice(0, 10)

  const item: Friend = { id, name, avatar, type, username, albumList: [], photoList: [] }
  const lastActiveOptions = ['Just now', '2h ago', '4h ago', '1d ago', '3d ago']
  item.lastActive = lastActiveOptions[Math.floor(Math.random() * lastActiveOptions.length)]
  item.mutualFriends = Math.floor(Math.random() * 10)

  return item
}

const FriendsScreen = () => {
  const router = useRouter()
  const session = useSession()
  const { syncFriends, fetchChatInfo } = useSync()

  const { colors, isDark } = useTheme()
  const { friends, addFriend, getFriend, removeFriend, changeFriendType } = useFriendStore()
  const { addChat, hasChat, getChatWithFriend } = useChatStore()

  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<Friend[]>([])
  

  const myFriend = friends.filter((f) => f.type === FriendStatus.FRIEND)
  const pendingRequests = friends.filter((f) => f.type === FriendStatus.PENDING)
  const suggestedFriends = friends.filter((f) => f.type === FriendStatus.SUGGESTED)

  useEffect(() => {
    if (bypassLogin()) {
      return
    }

    if (!isAuthenticated(session)) {
      router.replace('/(auth)/LoginScreen')
    }
    
    // fetch suggested friends
    syncFriends(session);
    session.apiWithToken.get('/user/friends/suggested?limit=10')
      .then((res) => {
        const data = res.data.suggestedFriends
        const parsedData = data.map((user: FriendResponse) => ({
          ...user,
          avatar: user.iconUrl ? parsePublicUrl(user.iconUrl) : undefined,
          type: FriendStatus.SUGGESTED,
          albumList: [],
        }))
        parsedData.forEach((friend: Friend) => addFriend(friend))
      })
      .catch((error) => {
        console.error('Error fetching suggested friends:', error)
      })
  }, [])
  const onPressMessage = (friendID: string) => {
    const chat = getChatWithFriend(friendID)
    if (!chat) {
      const friend = getFriend(friendID)!
      session.apiWithToken.post(`/chat/create/direct`, {
        targetUserId: friendID
      }).then((res) => {
        addChat({
          id: res.data.conversationId,
          type: "direct",
          participants: [{
            _id: friendID,
            name: friend.name,
            avatar: friend.avatar
          }],
          initialDate: new Date(),
          messages: [],
          unreadCount: 0,
          lastMessageTime: new Date()
        })
        router.dismiss()
        router.push({ pathname: '/screens/ChatScreen', params: { chatID: res.data.conversationId } })
      })
      .catch(async (err) => {
        if (err.response.status === 409) {
          // Chat exists on server but is deleted locally
          const existingConversationId = err.response.data.detail.conversationId
          const newChat = await fetchChatInfo(session, existingConversationId)
          addChat(newChat)
          router.push({ pathname: '/screens/ChatScreen', params: { chatID: existingConversationId } })
        } else {
          console.error("Error creating chat", err)
        }
      })
    } else {
      router.push({ pathname: '/screens/ChatScreen', params: { chatID: chat.id } })
    } 
  }

  const fetchUsers = async (query: string) => {
    setIsLoading(true)
    if (process.env.EXPO_PUBLIC_BYPASS_LOGIN == 'true') {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const mockUsers: Friend[] = [
        {
          id: '1',
          name: 'Alex Johnson',
          username: 'alexj',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          albumList: [],
          type: FriendStatus.SUGGESTED,
          lastActive: 'Just now',
          mutualFriends: 3,
          photoList: []
        },
        {
          id: '2',
          name: 'Sarah Williams',
          username: 'sarahw',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
          albumList: [],
          type: FriendStatus.SUGGESTED,
          lastActive: 'Just now',
          mutualFriends: 2,
          photoList: []
        },
        {
          id: '3',
          name: 'Michael Brown',
          username: 'michaelb',
          avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
          albumList: [],
          type: FriendStatus.SUGGESTED,
          lastActive: 'Just now',
          mutualFriends: 1,
          photoList: []
        },
        {
          id: '4',
          name: 'Jessica Davis',
          username: 'jessicad',
          avatar: 'https://randomuser.me/api/portraits/women/17.jpg',
          albumList: [],
          type: FriendStatus.SUGGESTED,
          lastActive: 'Just now',
          mutualFriends: 5,
          photoList: []
        }
      ]
  
      const users = [...friends, ...mockUsers]
  
      const filteredUsers = users.filter((user) => user.name.toLowerCase().includes(query.toLowerCase()))

      setSearchResults(query ? filteredUsers : [])
      setIsLoading(false)
    } else {
      // actual fetching from server
      session.apiWithToken.get('/user/search', { params: { query } })
        .then((res) => {
          const data = res.data.users
          const parsedData = data.map((resultUser: FriendResponse) => ({
            ...resultUser,
            avatar: resultUser.iconUrl ? parsePublicUrl(resultUser.iconUrl) : undefined,
            type: resultUser.friendStatus,  
            albumList: [],
          }))
          console.log("parsedData", parsedData);
          setSearchResults(parsedData)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error('Error fetching users:', error)
          Alert.alert('Error', 'Failed to fetch users. Please try again later.')
          setSearchResults([])
          setIsLoading(false)
        })
    }

    
  }

  useEffect(() => {
    if (query.trim() && query.length > 2) {
      setIsSearching(true)
      fetchUsers(query)
      return
    } else {
      setIsSearching(false)
      setSearchResults([])
    }
  }, [query])

  const sendFriendRequest = (id: string) => {
    session.apiWithToken.post(`/user/friends/invite/${id}`)
      .then((res) => {
        Alert.alert('Success', 'Friend request sent successfully.');

        // Update the friend type in the searchResults state
        setSearchResults((prevResults) =>
          prevResults.map((friend) =>
            friend.id === id ? { ...friend, type: FriendStatus.OUTGOING } : friend
          )
        );

        // Update the friend type in the global store (optional)
        changeFriendType(id, FriendStatus.PENDING);
      })
      .catch((error) => {
        console.error('Error sending friend request:', error);
        Alert.alert('Error', error.response?.data?.detail || 'Failed to send friend request. Please try again later.');
      });
  };

  const cancelFriendRequest = (id: string) => {
    session.apiWithToken.post(`/user/friends/remove/${id}`)
      .then((res) => {
        Alert.alert('Success', 'Friend request canceled successfully.');
        setSearchResults((prevResults) =>
          prevResults.map((friend) =>
            friend.id === id ? { ...friend, type: FriendStatus.SUGGESTED } : friend
          )
        );
        removeFriend(id)
      })
      .catch((error) => {
        console.error('Error canceling friend request:', error);
        Alert.alert('Error', error.response?.data?.detail || 'Failed to cancel friend request. Please try again later.');
      });
  };

  const handleFriendRequest = (id: string, accept: boolean) => {
    if (accept) {
      session.apiWithToken.post(`/user/friends/accept/${id}`)
        .then((res) => {
          Alert.alert('Success', 'Friend request accepted successfully.');
          changeFriendType(id, FriendStatus.FRIEND)
        })
        .catch((error) => {
          console.error('Error accepting friend request:', error);
        })
    } else {
      cancelFriendRequest(id)
    }
  }

  const openUserProfile = (id: string) => {
    router.push({ pathname: '/(modal)/FriendProfileModal', params: { friendID: id } })
  }

  // #region friend item
  const renderFriendItem = ({ item }: { item: Friend }) => (
    <SwipeableRow
      title={item.name}
      onDelete={() => removeFriend(item.id)}
      description="Are you sure to remove this friend?"
    >
      <TouchableHighlight
        activeOpacity={0.8}
        onPress={() => openUserProfile(item.id)}
        underlayColor={isDark ? '#3A3A4A' : '#DCDCE2'}
      >
        <View style={[styles.friendItem, { backgroundColor: colors.background }]}>
          {
            item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
              <Ionicons name="person-circle-outline" size={50} color={colors.gray} style={{ marginLeft: 4 }} />
            )
          }
          
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Themed.Text style={styles.friendName}>{item.name}</Themed.Text>
            <Themed.Text style={{ fontSize: 13 }} text70>
              {item.lastActive}
            </Themed.Text>
          </View>
          <TouchableOpacity style={{ padding: 8 }} activeOpacity={0.7} onPress={() => onPressMessage(item.id)}>
            <Ionicons name="chatbubble-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </TouchableHighlight>
    </SwipeableRow>
  )
  // #endregion

  // #region pending request
  const renderPendingRequestItem = ({ item }: { item: Friend }) => (
    <Themed.View style={styles.requestItem}>
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
        activeOpacity={0.7}
        onPress={() => openUserProfile(item.id)}
      >
        {
            item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
              <Ionicons name="person-circle-outline" size={50} color={colors.gray} style={{ marginLeft: 4 }} />
            )
          }
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Themed.Text style={styles.friendName}>{item.name}</Themed.Text>
          {item.mutualFriends && item.mutualFriends > 0 ? (
            <Themed.Text style={{ fontSize: 13 }} text70>
              {item.mutualFriends} mutual friends
            </Themed.Text>
          ) : null}
        </View>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          style={[styles.actionButton, styles.acceptButton]}
          onPress={() => handleFriendRequest(item.id, true)}
          activeOpacity={0.7}
        >
          <Themed.Text style={{ color: '#fff', fontSize: 14, fontWeight: '500' }}>Accept</Themed.Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => handleFriendRequest(item.id, false)}
          activeOpacity={0.7} 
        >
          <Themed.Text style={{ color: '#666', fontSize: 14, fontWeight: '500' }}>Decline</Themed.Text>
        </TouchableOpacity>
      </View>
    </Themed.View>
  )
  // #endregion

  // #region suggested friends
  const renderSuggestedFriendItem = ({ item }: { item: Friend }) => (
    <Themed.View style={styles.suggestedItem} shadow>
      <TouchableOpacity style={{ alignItems: 'center' }} activeOpacity={0.7} onPress={() => openUserProfile(item.id)}>
      {
            item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
              <Ionicons name="person-circle-outline" size={50} color={colors.gray} style={{ marginLeft: 4 }} />
            )
          }
        <View style={styles.suggestedInfo}>
          <Themed.Text style={[styles.friendName, { textAlign: 'center' }]}>{item.name}</Themed.Text>
          {(item.mutualFriends && item.mutualFriends > 0) ? <Themed.Text style={{ fontSize: 13 }} text70>
            {item.mutualFriends} mutual friends
          </Themed.Text> : null}
        </View>
      </TouchableOpacity>
      <TouchableBounce style={styles.addButton} onPress={() => sendFriendRequest(item.id)}>
        <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
      </TouchableBounce>
    </Themed.View>
  )
  // #endregion

  // #region screen main view
  const renderFriendList = () => (
    <View>
      {pendingRequests.length > 0 && (
        <>
          <SectionHeader
            title="Friend Requests"
            style={styles.sectionHeader}
            buttonText="$add"
            onPress={() => addFriend(generateUser(FriendStatus.PENDING))}
          />
          <Themed.View type="divider" />
          <Animated.FlatList
            data={pendingRequests}
            renderItem={renderPendingRequestItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <Themed.View type="divider" style={{ marginLeft: 70 }} />}
            itemLayoutAnimation={LinearTransition.duration(300)}
          />
        </>
      )}

      <SectionHeader
        title="Your Friends"
        style={styles.sectionHeader}
        buttonText="$add"
        onPress={() => addFriend(generateUser(FriendStatus.FRIEND))}
      />

      {myFriend.length > 0 ? (
        <>
          <Themed.View type="divider" />
          <Animated.FlatList
            data={myFriend}
            renderItem={renderFriendItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <Themed.View type="divider" style={{ marginLeft: 70 }} />}
          />
        </>
      ) : (
        <Form.Section>
          <ContentUnavailable
            title="Connect with Friends"
            systemImage="person.2"
            description="You haven't added any friends yet. Explore suggested friends or search to start connecting!"
          />
        </Form.Section>
      )}

      <SectionHeader
        title="Suggested Friends"
        style={styles.sectionHeader}
        buttonText="$add"
        onPress={() => addFriend(generateUser(FriendStatus.SUGGESTED))}
      />
      <Themed.View type="divider" />
      <Animated.FlatList
        data={suggestedFriends}
        renderItem={renderSuggestedFriendItem}
        keyExtractor={(item) => item.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestedList}
      />
    </View>
  )
  // #endregion

  // #region user search result component
  const renderUserItem = ({ item }: { item: Friend }) => (
    <TouchableOpacity
      style={styles.userItem}
      activeOpacity={0.7}
      onPress={() => router.push({ pathname: '/(modal)/FriendProfileModal', params: { friendID: item.id } })}
    >
      {
        item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <Ionicons name="person-circle-outline" size={50} color={colors.gray} style={{ marginLeft: 4 }} />
        )
      } 
      <View style={styles.userInfo}>
        <Themed.Text style={styles.userName}>{item.name}</Themed.Text>
        <Themed.Text style={{ fontSize: 14 }} text50>
          @{item.username}
        </Themed.Text>
      </View>
      {
        item.type === FriendStatus.SUGGESTED && (  
          <TouchableOpacity
            style={{ backgroundColor: '#007AFF', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 }}
            onPress={() => sendFriendRequest(item.id)}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        )
      }
      {
        item.type === FriendStatus.OUTGOING && (  
          <TouchableOpacity
            style={{ backgroundColor: colors.orange, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 }}
            onPress={() => {
              Alert.alert('Cancel Request', 'Are you sure to cancel this request?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK', onPress: () => {
                  cancelFriendRequest(item.id)
                } }
              ])
            }}
          >
            <Text style={styles.addButtonText}>Pending</Text>
          </TouchableOpacity>
        )
      }
      {
        item.type === FriendStatus.FRIEND && (
          <TouchableOpacity
            style={{ backgroundColor: colors.green, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 }}
          >
            <Text style={styles.addButtonText}>Friend</Text>
          </TouchableOpacity>
        )
      }
    </TouchableOpacity>
  )
  // #endregion

  // #region empty result component
  const renderEmptyResult = () =>
    isLoading ? (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    ) : (
      <Form.Section style={{ marginTop: 16 }}>
        <ContentUnavailable
          title="No Users Found"
          systemImage="magnifyingglass"
          description="Check the spelling, or try a different name."
        />
      </Form.Section>
    )
  // #endregion

  const onSearch = () => {}

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderText
              text="add pending"
              textProps={{ state: true }}
              onPress={() => addFriend(generateUser(FriendStatus.PENDING))}
            />
          ),
          headerSearchBarOptions: {
            placeholder: 'Search',
            autoFocus: true,
            autoCapitalize: 'none',
            hideWhenScrolling: false,
            onChangeText: (e) => {
              setQuery(e.nativeEvent.text)
            },
            onFocus: () => setIsFocused(true),
            onCancelButtonPress: () => {
              setIsFocused(false)
            },
            onSearchButtonPress: () => {
              onSearch()
            }
          }
        }}
      />

      <Themed.ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {isFocused ? (
          <View style={{ flex: 1 }}>
            {searchResults.length > 0 ? (
              <Animated.FlatList
                data={searchResults}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 8 }}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <Themed.View type="divider" />}
                extraData={friends}
              />
            ) : (
              isSearching && renderEmptyResult()
            )}
          </View>
        ) : (
          renderFriendList()
        )}
      </Themed.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    fontSize: 17
  },
  sectionCount: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF'
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
    backgroundColor: '#007AFF'
  },
  declineButton: {
    backgroundColor: '#EFEFEF'
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
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  userInfo: {
    flex: 1,
    marginLeft: 12
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3A3A3C',
    marginTop: 16
  },
  emptySubText: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8
  }
})

export default FriendsScreen
