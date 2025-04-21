import { View, Text } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Image } from 'expo-image'

import { Stack, Form } from '@/components/router-form'
import { Themed } from '@/components'
import { useChatStore } from '@/hooks'

const ChatProfileScreen = () => {
  const { chatID } = useLocalSearchParams<{ chatID: string }>()
  const { getChat } = useChatStore()

  const { chatTitle, iconUrl, chatSubtitle } = getChat(chatID)

  return (
    <Themed.View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Chat info' }} />
      <Form.List>
        <Form.Section>
          <View style={{ alignItems: 'center', gap: 8, padding: 16, flex: 1 }}>
            <Image
              source={{ uri: iconUrl }}
              style={{
                aspectRatio: 1,
                height: 64,
                borderRadius: 8
              }}
            />
            <Form.Text style={{ fontSize: 20, fontWeight: '600' }}>{chatTitle}</Form.Text>
            <Form.Text style={{ textAlign: 'center' }}>
              from <Form.Text style={{ fontWeight: '700' }}>{chatSubtitle}</Form.Text>
            </Form.Text>
          </View>
        </Form.Section>

        <Form.Section title="Contact info">
          <Form.Text>Info #1</Form.Text>
          <Form.Text>Info #2</Form.Text>
          <Form.Text>Info #3</Form.Text>
        </Form.Section>

        <Form.Section>
          <Form.Text systemImage="photo">Media and docs</Form.Text>
          <Form.Text systemImage="star">Pinned messages</Form.Text>
        </Form.Section>

        <Form.Section>
          <Form.Text systemImage={{ name: 'trash', color: 'red' }} style={{ color: 'red' }} onPress={() => {}}>
            Clear chat
          </Form.Text>
        </Form.Section>
      </Form.List>
    </Themed.View>
  )
}

export default ChatProfileScreen
