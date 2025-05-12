/**
 * Screen Params:
 * isShared?: string
 */
import { useState, useEffect } from 'react'
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert
} from 'react-native'

import { useRouter } from 'expo-router'
import { Themed } from '@/components'
import { HeaderText } from '@/components/ui'
import { Stack } from '@/components/router-form'
import { useTheme, useFriendStore, useUserStore, useChatStore } from '@/hooks'
import { ChatItem } from '@/types'
import { useSettings } from '@/contexts'
import { bypassLogin, isAuthenticated, useSession } from '@/contexts/auth'
import { Avatar } from '@/components/Avatar'

const CreateGroupChatModal = () => {
  const router = useRouter()
  const session = useSession()
  const { settings, setSetting } = useSettings()

  const { user } = useUserStore()
  const { addChat } = useChatStore()
  const { colors } = useTheme()
  const { getFriend } = useFriendStore()

  const [chatName, setChatName] = useState('')

  useEffect(() => {
    return () => {
      setSetting('friendsToChat', [])
    }
  }, [])

  // endregion

  const handleCreateChat = async () => {
    if (bypassLogin()) {
      return
    }
    if (!isAuthenticated(session)) {
      router.replace('/(auth)/LoginScreen')
      return
    }

    if (chatName.trim() === '') {
      Alert.alert('Please enter a name for the chat')
      return
    }

    if (settings.friendsToChat.length === 0) {
      Alert.alert('Please add at least one friend to the chat')
      return
    }

    // create chat with backend
    session.apiWithToken
      .post('/chat/create/group', {
        name: chatName,
        participants: [user.id, ...settings.friendsToChat]
      })
      .then((res) => {
        const newChat = {
          id: res.data.conversationId,
          title: chatName,
          participants: [
            {
              _id: user.id,
              name: user.name,
              avatar: user.iconUrl
            },
            ...settings.friendsToChat.map((id) => {
              const friend = getFriend(id)!
              return {
                _id: friend.id,
              name: friend.name,
              avatar: friend.avatar
              }
            })
          ],
          createdAt: res.data.createdAt,
          createdBy: user.id,
          type: 'group',
          lastMessageTime: res.data.lastMessageTime,
          messages: [],
          initialDate: res.data.initialDate,
          unreadCount: 0
        } as ChatItem
        addChat(newChat)
        router.back()
      })
      .catch((err) => {
        console.error(err)
      })
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          headerTitle: 'New Group Chat',
          headerLeft: () => <HeaderText text="Cancel" textProps={{ state: true }} onPress={() => router.back()} />,
          headerRight: () => (
            <HeaderText text="Create" textProps={{ state: chatName.trim() !== '' }} onPress={handleCreateChat} />
          )
        }}
        sheet
      />

      <Themed.ScrollView contentContainerStyle={{ flex: 1, padding: 16, paddingBottom: 60 }}>
        <View style={styles.chatInfoSection}>
          <View style={styles.chatNameContainer}>
            <TextInput
              style={[styles.chatNameInput, { color: colors.text }]}
              value={chatName}
              onChangeText={setChatName}
              placeholder="Chat Name"
              placeholderTextColor="#999"
              maxLength={30}
            />
            <Themed.Text style={styles.charCount} text30>
              {chatName.length}/30
            </Themed.Text>
          </View>
        </View>

        <TouchableOpacity
          style={{ padding: 2, paddingHorizontal: 16, alignSelf: 'center' }}
          onPress={() => router.push({ pathname: '/(modal)/AddFriendToGroupModal', params: { type: 'chat' } })}
          activeOpacity={0.7}
        >
          <Themed.Text style={styles.addFriendText} type="link">Add friend</Themed.Text>
        </TouchableOpacity>

        {settings.friendsToChat.length > 0 && (
          <Themed.View style={{ padding: 12, borderRadius: 12 }} type="secondary">
            <ScrollView style={{ width: '100%' }} horizontal>
              {settings.friendsToChat.map((item) => (
                <Themed.View key={item} style={styles.friendAvatar} shadow>
                  <Avatar
                    iconUrl={getFriend(item)!.avatar!}
                    username={getFriend(item)!.username}
                    size={50}
                  />
                </Themed.View>
              ))}
            </ScrollView>
          </Themed.View>
        )}

        <TouchableOpacity style={[styles.createButton]} onPress={handleCreateChat}>
          <Text style={styles.createButtonText}>Create Group Chat</Text>
        </TouchableOpacity>
      </Themed.ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  chatInfoSection: {
    alignItems: 'center',
    marginBottom: 16
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 16
  },
  chatNameContainer: {
    width: '100%',
    alignItems: 'center'
  },
  chatNameInput: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent'
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  charCount: {
    alignSelf: 'flex-end',
    fontSize: 12
  },
  addFriendText: {
    textAlign: 'center'
  },
  switchContainer: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600'
  },
  createButton: {
    backgroundColor: '#4a80f5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  friendAvatar: {
    padding: 8,
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.2,
    margin: 6
  }
})

export default CreateGroupChatModal
