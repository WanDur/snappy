/**
 * Screen Params:
 * chatID: string
 */
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { useState, useRef } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { Image } from 'expo-image'

import { Stack, Form } from '@/components/router-form'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { ModalCloseButton } from '@/components/ui'
import { Themed } from '@/components'
import { useChatStore, useUserStore } from '@/hooks'

const ChatProfileScreen = () => {
  const { chatID } = useLocalSearchParams<{ chatID: string }>()
  const { user } = useUserStore()
  const { getChat, setChatInfo } = useChatStore()

  const { chatTitle, iconUrl, chatSubtitle } = getChat(chatID)
  const members = [
    { name: user.name, username: user.username, icon: user.iconUrl },
    { name: chatTitle, username: `@${chatTitle.toLowerCase()}`, icon: iconUrl }
  ]

  const inputRef = useRef<TextInput>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [titleDraft, setTitleDraft] = useState(chatTitle)

  const toggleEdit = () => {
    if (isEditing) {
      setChatInfo(chatID, titleDraft.trim() || chatTitle)
    } else {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
    setIsEditing(!isEditing)
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Chat Settings', headerLeft: () => <ModalCloseButton /> }} />

      <Themed.ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
        <Form.List>
          <View style={{ alignItems: 'center', gap: 12 }}>
            <Image
              source={{ uri: iconUrl }}
              style={{
                aspectRatio: 1,
                height: 100,
                width: 100,
                borderRadius: 50
              }}
            />
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
              <TouchableOpacity style={{ padding: 2 }} onPress={toggleEdit}>
                <IconSymbol name={isEditing ? 'checkmark' : 'square.and.pencil'} size={20} color="gray" />
              </TouchableOpacity>
            </View>
          </View>

          <Form.Section title="Members">
            {members.length > 0 ? (
              members.map((member, index) => (
                <Form.HStack key={index}>
                  {member.icon ? (
                    <Image source={{ uri: member.icon }} style={{ aspectRatio: 1, height: 48, borderRadius: 24 }} />
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
                      <Text style={{ color: 'white' }}>{member.name.toUpperCase().slice(0, 2)}</Text>
                    </View>
                  )}

                  <View />
                  <View>
                    <Form.Text style={{ fontWeight: '600' }}>{member.name}</Form.Text>
                    <Text style={{ color: '#666' }}>{member.username}</Text>
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
            <Form.Text systemImage="person.badge.plus" onPress={() => {}}>
              Add members
            </Form.Text>
            <Form.Text systemImage="trash" style={{ color: 'red' }} onPress={() => {}}>
              Clear chat
            </Form.Text>
            <Form.Text
              systemImage={{ name: 'rectangle.portrait.and.arrow.right', color: 'red' }}
              style={{ color: 'red' }}
              onPress={() => {}}
            >
              Leave chat
            </Form.Text>
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
