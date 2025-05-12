/**
 * Screen Params:
 * chatID: string
 */
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native'
import { useState, useRef } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { Image } from 'expo-image'

import { Stack, Form } from '@/components/router-form'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { ModalCloseButton } from '@/components/ui'
import { Themed } from '@/components'
import { useChatStore, useFriendStore, useUserStore } from '@/hooks'
import { getChatIcon, getChatTitle } from '../(tabs)/chats/index-chats'
import { Avatar } from '@/components/Avatar'
const ChatProfileScreen = () => {
  const { chatID } = useLocalSearchParams<{ chatID: string }>()
  const { user } = useUserStore()
  const { getChat, updateChatInfo, deleteChat } = useChatStore()
  const { getFriend } = useFriendStore()

  const chat = getChat(chatID)
  const chatTitle = getChatTitle(chat, user)
  const iconUrl = getChatIcon(chat, user)
  const memberIds = chat.participants.map((participant) => participant._id.toString())
  const members = memberIds.map((id) => {
    if (id === user.id) {
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.iconUrl
      }
    }

    const friend = getFriend(id)!
    return {
      id: friend.id,
      name: friend.name,
      username: friend.username,
      avatar: friend.avatar
    }
  })
  const inputRef = useRef<TextInput>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [titleDraft, setTitleDraft] = useState(chatTitle)

  const toggleEdit = () => {
    if (isEditing) {
      updateChatInfo(chatID, { title: titleDraft.trim() || chatTitle })
    } else {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
    setIsEditing(!isEditing)
  }

  const handleClearChat = () => {
    Alert.alert('Clear chat', 'Are you sure you want to clear this chat?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => {
        router.dismiss(2)
        deleteChat(chatID)
      } }
    ])
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Chat Settings', headerLeft: () => <ModalCloseButton /> }} />

      <Themed.ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        <Form.List>
          <View style={{ alignItems: 'center', gap: 12 }}>
            <Avatar size={100} iconUrl={iconUrl} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {isEditing ? (
                <TextInput
                  ref={inputRef}
                  style={styles.inputGhost}
                  onChangeText={setTitleDraft}
                  placeholder={chatTitle}
                  returnKeyType="done"
                  onSubmitEditing={toggleEdit}
                />
              ) : (
                <Form.Text style={{ fontSize: 20, fontWeight: '600', flexShrink: 1 }}>{chatTitle}</Form.Text>
              )}
              {chat.type === 'group' && (
                <TouchableOpacity style={{ padding: 2 }} onPress={toggleEdit}>
                  <IconSymbol name={isEditing ? 'checkmark' : 'square.and.pencil'} size={20} color="gray" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Form.Section title="Members">
            {members.length > 0 ? (
              members.map((member, index) => (
                <Form.HStack key={index}>
                  {member.avatar ? (
                    <Image source={{ uri: member.avatar.toString() }} style={{ aspectRatio: 1, height: 48, borderRadius: 24 }} />
                  ) : (
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: '#4A90E2',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Text style={{ color: 'white' }}>{member.name!.toUpperCase().slice(0, 2)}</Text>
                    </View>
                  )}

                  <View />
                  <View>
                    <Form.Text style={{ fontWeight: '600' }}>{member.name}</Form.Text>
                    <Text style={{ color: '#666' }}>@{member.username!}</Text>
                  </View>
                </Form.HStack>
              ))
            ) : (
              <View>
                <Text style={{ color: '#666' }}>No members found</Text>
              </View>
            )}
          </Form.Section>

          <Form.Section>
            {chat.type === 'group' && (
              <Form.Text systemImage="person.badge.plus" onPress={() => {}}>
                Add members
              </Form.Text>
            )}
            <Form.Text systemImage="trash" style={{ color: 'red' }} onPress={handleClearChat}>
              Clear chat
            </Form.Text>
            {chat.type === 'group' && (
              <Form.Text
                systemImage={{ name: 'rectangle.portrait.and.arrow.right', color: 'red' }}
                style={{ color: 'red' }}
                onPress={() => {}}
              >
                Leave chat
              </Form.Text>
            )}
          </Form.Section>
        </Form.List>
      </Themed.ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  inputGhost: {
    fontSize: 20,
    fontWeight: '600',
    flexShrink: 1,
    paddingVertical: 0,
    backgroundColor: 'transparent',
    borderWidth: 0
  }
})

export default ChatProfileScreen
