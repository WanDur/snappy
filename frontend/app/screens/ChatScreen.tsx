/**
 * Screen Params:
 * chatID: string
 */
import { TextInput, Alert, TouchableOpacity, View, Image, Keyboard } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState, useRef } from 'react'
import { GiftedChat, Bubble, InputToolbar, BubbleProps } from 'react-native-gifted-chat'
import { useHeaderHeight } from '@react-navigation/elements'
import { Ionicons } from '@expo/vector-icons'
import { isAxiosError } from 'axios'

import { TMessage } from '@/types'
import { Themed } from '@/components'
import { MessageInput, AudioComponent, FileComponent, ImageComponent, ImagesComponent } from '@/components/chat'
import { Constants } from '@/constants'
import { useChatStore, useUserStore, useTheme } from '@/hooks'
// import { useSession } from '@/contexts/auth'
import { Attachment, MessageResponse, SYSTEM } from '@/types/chats.type'
import { Avatar } from '@/components/Avatar'
import { getChatTitle } from '../(tabs)/chats/index-chats'
import { getChatIcon } from '../(tabs)/chats/index-chats'
import { bypassLogin, isAuthenticated, parsePublicUrl, useSession } from '@/contexts/auth'

const ChatScreen = () => {
  const session = useSession()
  const headerHeight = useHeaderHeight()
  const { theme, colors, chatColors } = useTheme()
  const router = useRouter()

  const { chatID } = useLocalSearchParams<{ chatID: string }>()

  const { user } = useUserStore()
  const { getChat, addMessage, clearUnreadCount } = useChatStore()

  const chat = getChat(chatID)

  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [allMessages, setAllMessages] = useState<TMessage[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [iconUrl, setIconUrl] = useState(getChatIcon(chat, user))
  const [chatTitle, setChatTitle] = useState(getChatTitle(chat, user))

  const textInputRef = useRef<TextInput>(null)
  const loadMessageRef = useRef<number>(0)

  const { initialDate, messages } = getChat(chatID)

  const loadNewMessages = async () => {
    const chat = getChat(chatID)
    if (chat.messages.length + 1 != allMessages.length) {
      setAllMessages([
        ...chat.messages,
        {
          _id: 0,
          system: true,
          text: 'Start of the chat',
          createdAt: initialDate,
          user: SYSTEM,
          attachments: []
        }
      ])
      clearUnreadCount(chatID)
    }
  }

  useEffect(() => {
    loadMessageRef.current = window.setInterval(loadNewMessages, 1000)
    return () => {
      clearTimeout(loadMessageRef.current)
    }
  }, [])

  useEffect(() => {
    if (bypassLogin()) {
      return
    }
    if (!isAuthenticated(session)) {
      router.replace('/(auth)/LoginScreen')
      return
    }

    setAllMessages([
      ...messages,
      {
        _id: 0,
        system: true,
        text: 'Start of the chat',
        createdAt: initialDate,
        user: SYSTEM,
        attachments: []
      }
    ])
  }, [])

  /**
   * FIXME - known issue: the keyboard height is not calculated correctly because of header layout for gifted-chat@2.6.5
   * textinput or some messages is not visible in the screen
   * https://github.com/FaridSafi/react-native-gifted-chat/issues/2569#issuecomment-2560940586
   *
   *** used headerTransparent and {headerHeight} as a workaround
   */

  // setting to true will fix the scroll indicator offset, but headerTransparent will lost its blur effect
  const FIX_SCROLL_INDICATOR_OFFSET = false

  useEffect(() => {
    setKeyboardHeight(FIX_SCROLL_INDICATOR_OFFSET ? 0 : headerHeight)
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      // add a offset to the view so the first few messages are not hidden by the keyboard
      setKeyboardHeight(event.endCoordinates.height - 30 + (FIX_SCROLL_INDICATOR_OFFSET ? 0 : headerHeight))
    })
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // TODO: animate the view back to the original position
      setKeyboardHeight(FIX_SCROLL_INDICATOR_OFFSET ? 0 : headerHeight)
    })
    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  const handleSendMessage = async (message: string, attachments: Attachment[] = []) => {
    if (message.trim() === '' && attachments.length === 0) {
      return
    }
    try {
      const formData = new FormData()
      formData.append('message', message)
      for (const attachment of attachments) {
        formData.append('attachments', {
          uri: attachment.url,
          name: attachment.name,
          type: attachment
        } as any)
      }
      const messageRes: MessageResponse = (
        await session.apiWithToken.post(`/chat/conversation/${chatID}/send`, formData)
      ).data
      const newMessage = {
        _id: messageRes.messageId,
        user: {
          _id: user.id,
          avatar: user.iconUrl
        },
        text: message,
        createdAt: messageRes.timestamp,
        attachments: messageRes.attachments.map((attachment) => ({
          type: attachment.type,
          url: parsePublicUrl(attachment.url),
          name: attachment.name
        }))
      } as TMessage

      addMessage(chatID, [newMessage])
      setAllMessages([newMessage, ...allMessages])
    } catch (error) {
      if (isAxiosError(error)) {
        Alert.alert('Error', error.response?.data.message || 'An error occurred sending the message')
      } else {
        Alert.alert('Error', 'An error occurred sending the message')
      }
    }
  }

  const renderAttachments = (position: 'left' | 'right', attachments: Attachment[]) => {
    if (attachments.length > 1 && attachments[0].type.split('/')[0] === 'image') {
      // multiple images
      const uris = JSON.stringify(attachments.map((attachment) => attachment.url))
      return <ImagesComponent uri={uris} />
    }
    return attachments.map((attachment, index) => {
      const [fileType, fileSubtype] = attachment.type.split('/')
      if (fileType == 'image') {
        return <ImageComponent uri={attachment.url} key={index} />
      } else if (fileType == 'audio') {
        return <AudioComponent uri={attachment.url} key={index} />
      } else {
        return (
          <FileComponent
            position={position}
            filePath={attachment.url}
            fileType={attachment.type}
            fileName={attachment.name}
            key={index}
          />
        )
      }
    })
  }

  return (
    <Themed.View style={{ flex: 1, paddingBottom: 10 }}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                gap: 10,
                paddingBottom: 4,
                alignItems: 'center',
                width: Constants.screenWidth / 1.5
              }}
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/(modal)/ChatSettingModal', params: { chatID } })}
            >
              <Avatar iconUrl={iconUrl} size={36} />
              <View>
                <Themed.Text style={{ fontSize: 16, fontWeight: '500' }}>{chatTitle}</Themed.Text>
              </View>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={{ padding: 2 }}
              onPress={() => setModalVisible(!modalVisible)}
              // FIXME: onPress sometimes does not work on Android, used onPressIn as workaround
              onPressIn={() => !Constants.isIOS && setModalVisible(!modalVisible)}
              activeOpacity={0.7}
            >
              <Ionicons name="reorder-three-outline" size={26} color={colors.text} />
            </TouchableOpacity>
          ),
          headerBackTitle: '',
          headerTransparent: true,
          headerBlurEffect: 'systemChromeMaterial',
          headerLargeTitleShadowVisible: true,
          headerShadowVisible: true,
          ...(!Constants.isIOS && { headerStyle: { backgroundColor: colors.background } })
        }}
      />

      {FIX_SCROLL_INDICATOR_OFFSET && <View style={{ height: headerHeight }} />}

      <GiftedChat
        messages={allMessages}
        listViewProps={{
          contentContainerStyle: {
            flexGrow: 1,
            justifyContent: 'flex-start',
            paddingBottom: keyboardHeight
          },
          showsVerticalScrollIndicator: FIX_SCROLL_INDICATOR_OFFSET
        }}
        renderSend={() => null}
        user={{ _id: user.id }}
        renderBubble={(props: BubbleProps<TMessage>) => {
          return (
            <View>
              <Bubble
                {...props}
                wrapperStyle={chatColors.wrapper}
                textStyle={chatColors.text}
                renderCustomView={(prop) => {
                  return (
                    <View style={{ flexDirection: 'column' }}>
                      {props.currentMessage.attachments.length > 0 &&
                        renderAttachments(props.position, props.currentMessage.attachments)}
                    </View>
                  )
                }}
              />
            </View>
          )
        }}
        renderInputToolbar={(props) => (
          <InputToolbar
            {...props}
            containerStyle={{
              borderTopColor: colors.borderColor
            }}
            renderComposer={(props) => (
              <MessageInput {...props} textInputRef={textInputRef} onSend={handleSendMessage} />
            )}
          />
        )}
        extraData={{ theme }}
        shouldUpdateMessage={(props, nextProps) => {
          return props !== nextProps
        }}
      />
    </Themed.View>
  )
}

export default ChatScreen
