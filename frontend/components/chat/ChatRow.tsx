import { View, Text, Image, StyleSheet, TouchableHighlight } from 'react-native'
import { useState, useRef } from 'react'
import { router } from 'expo-router'
import { BlurView } from 'expo-blur'
import Animated, { FadeInRight, FadeOutRight, ZoomIn, ZoomOut } from 'react-native-reanimated'
import BouncyCheckbox from 'react-native-bouncy-checkbox'

import { Themed, SwipeableRow } from '@/components'
import { formatChatDate } from '@/utils'
import { useChatStore, useTheme } from '@/hooks'

export interface ChatRowProps {
  id: string
  chatTitle: string
  chatSubtitle: string
  unreadCount: number
  iconUrl?: string
  lastMessageTime: Date
  
  isEdit?: boolean
  onSingleDelete?: () => void
  onCheckChat: (chatID: string, checked: boolean) => void
}

const ChatRow = ({
  id: chatId,
  chatTitle,
  chatSubtitle,
  unreadCount,
  iconUrl,
  lastMessageTime,
  onCheckChat,
  isEdit = false
}: ChatRowProps) => {

  const { deleteChat, clearUnreadCount } = useChatStore()

  const { reverseTheme } = useTheme()
  const { colors } = useTheme()
  const [checked, setChecked] = useState(false)
  const checkBoxRef = useRef(null)

  const onSingleDelete = () => {
    deleteChat(chatId)
  }

  return (
    <SwipeableRow id={chatId} title={chatTitle} onDelete={onSingleDelete}>
      <TouchableHighlight
        onPress={() => {
          if (isEdit) {
            // @ts-ignore
            checkBoxRef.current.onCheckboxPress()
            setChecked(!checked)
            return
          }
          clearUnreadCount(chatId)
          router.push({ pathname: '/screens/ChatScreen', params: { _chatID: chatId } })
        }}
        activeOpacity={0.8}
        underlayColor="#DCDCE2"
      >
        <Themed.View style={styles.container}>
          <View style={{ position: 'relative' }}>
            <Image source={{ uri: iconUrl }} style={styles.image} />
            {unreadCount > 0 && (
              <BlurView tint={reverseTheme} intensity={40} style={styles.unreadBadge}>
                <Text style={{ fontWeight: '800', color: 'white' }}>{unreadCount}</Text>
              </BlurView>
            )}
          </View>

          {isEdit && (
            <Animated.View
              entering={FadeInRight.delay(100).duration(200)}
              exiting={FadeOutRight.duration(200)}
              style={{
                position: 'absolute',
                width: 24,
                height: 24,
                right: 14,
                borderRadius: 24
              }}
            >
              <BouncyCheckbox
                ref={checkBoxRef}
                onPress={(isChecked) => {
                  onCheckChat(chatId, isChecked)
                }}
              />
            </Animated.View>
          )}

          <View style={{ flex: 1, gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Themed.Text style={{ fontSize: 18, fontWeight: 'bold' }}>{chatTitle}</Themed.Text>
              {!isEdit && (
                <Animated.View entering={ZoomIn.delay(100).duration(200)} exiting={ZoomOut.duration(200)} id={chatId}>
                  <Themed.Text style={{ fontSize: 14, color: '#6E6E73', alignSelf: 'center', right: 14 }}>
                    {formatChatDate(new Date(lastMessageTime))}
                  </Themed.Text>
                </Animated.View>
              )}
            </View>
            
            {chatSubtitle && <Themed.Text style={{ fontSize: 16, color: '#6E6E73' }}>{chatSubtitle}</Themed.Text>}
            
          </View>
        </Themed.View>
      </TouchableHighlight>
    </SwipeableRow>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingLeft: 20,
    paddingVertical: 10
  },
  image: {
    width: 54,
    height: 54,
    borderRadius: 50
  },
  unreadBadge: {
    position: 'absolute',
    bottom: 0,
    width: 20,
    height: 20,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default ChatRow
