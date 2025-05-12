import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import Animated, { LinearTransition } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Crypto from 'expo-crypto'
import { Stack, useRouter } from 'expo-router'

import { Themed } from '@/components'
import { ChatRow } from '@/components/chat'
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground'
import { useChatStore, useUserStore, useStorage, useTheme, useFriendStore } from '@/hooks'
import { ChatItem, User } from '@/types'
import { bypassLogin, isAuthenticated, useSession } from '@/contexts/auth'
// import { useSession } from '@/contexts/auth'
// import { FetchNewMessageResponse } from '@/types/chats.type'
import { useSync } from '@/hooks/useSync'
import { Ionicons } from '@expo/vector-icons'

const avatars = [
  'https://i.pravatar.cc/150?u=aguilarduke@marketoid.com',
  'https://i.pravatar.cc/150?u=baxterduke@marketoid.com',
  'https://i.pravatar.cc/150?u=myrnaduke@marketoid.com',
  'https://i.pravatar.cc/150?u=bessieduke@marketoid.com',
  'https://i.pravatar.cc/150?u=elladuke@marketoid.com',
  'https://i.pravatar.cc/150?u=herringduke@marketoid.com',
  'https://i.pravatar.cc/150?u=jerriduke@marketoid.com',
  'https://i.pravatar.cc/150?u=corneliaduke@marketoid.com',
  'https://i.pravatar.cc/150?u=muellerduke@marketoid.com',
  'https://i.pravatar.cc/150?u=anitaduke@marketoid.com',
  'https://i.pravatar.cc/150?u=beverleyduke@marketoid.com',
  'https://i.pravatar.cc/150?u=lindsayduke@marketoid.com',
  'https://i.pravatar.cc/150?u=lynnetteduke@marketoid.com'
]

const usernames = [
  'AlexStar21',
  'SunnyVibes_',
  'JakeOnTheGo',
  'LunaSparkle',
  'MaxWaveRider',
  'ZoeCloud9',
  'RileyBlaze',
  'NovaDreamer',
  'KaiAdventure',
  'MiaSkybound'
]

const getRandomLastOnline = () => {
  const random = Math.random()

  if (random < 0.1) {
    return 'Active now'
  } else if (random < 0.4) {
    const minutes = Math.floor(Math.random() * 59) + 1
    return `Active ${minutes} minute${minutes === 1 ? '' : 's'} ago`
  } else if (random < 0.7) {
    const hours = Math.floor(Math.random() * 23) + 1
    return `Active ${hours} hour${hours === 1 ? '' : 's'} ago`
  } else {
    return 'Active recently'
  }
}

const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
const getRandomDate = () => new Date(Date.now() - Math.floor(Math.random() * 10000000000))

export const getChatIcon = (chat: ChatItem, user: User): string | undefined => {
  if (chat.type == 'direct') {
    return chat.participants.find((participant) => participant._id !== user.id)?.avatar?.toString()
  }
  return undefined
}

export const getChatTitle = (chat: ChatItem, user: User): string => {
  if (chat.type == 'direct') {
    return chat.participants.find((participant) => participant._id !== user.id)!.name || "Error"
  } else {
    return chat.title || `Group Chat (${chat.participants.length})`
  }
  
}

export const ChatScreen = () => {
  const router = useRouter()
  const session = useSession()
  const { syncChats, fetchAllChatInfo } = useSync()

  const { colors, theme } = useTheme()
  const { top } = useSafeAreaInsets()
  const tabBarHeight = useBottomTabOverflow()
  const { friends } = useFriendStore()

  const { deleteItemFromStorage } = useStorage()
  const {
    chats,
    deleteChat,
    addUnreadCount
  } = useChatStore()
  const { user } = useUserStore()

  const [isEdit, setIsEdit] = useState(false)
  const [selectedChats, setSelectedChats] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [allChats, setAllChats] = useState<ChatItem[]>([])

  const refreshData = async () => {
    setLoading(true)
    await fetchAllChatInfo(session)
    await syncChats(session)
    setLoading(false)
  }

  useEffect(() => {
    if (bypassLogin()) return;
    if (!isAuthenticated(session)) {
      router.replace('/(auth)/LoginScreen')
      return
    }
    setLoading(true)
    refreshData()
    syncChats(session)
    setLoading(false)
  }, [])

  const deleteSingleChat = async (chatID: string) => {
    const updatedChatHistory = allChats.filter((chat) => chat.id !== chatID)
    setAllChats(updatedChatHistory)
    await deleteItemFromStorage(chatID)
  }

  const deleteMultiChat = async () => {
    for (const chatID of selectedChats) {
      deleteChat(chatID)
    }
    setSelectedChats([])
    setIsEdit(false)
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Chats',
          headerLeft: () => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (isEdit) {
                  deleteMultiChat()
                } else {
                  setIsEdit(!isEdit)
                }
              }}
              style={{ marginLeft: 6 }}
            >
              <Themed.Text type="link">
                {isEdit ? (selectedChats.length > 0 ? `Delete ${selectedChats.length}` : 'Done') : 'Edit'}
              </Themed.Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                router.push('/(modal)/CreateGroupChatModal')
              }}
              style={{ marginRight: -6 }}
            >
              <Ionicons name="add-circle-outline" size={24} color={colors.gray} />
            </TouchableOpacity>
          )
        }}
      />
      <Animated.FlatList
        data={Object.entries(chats).map(([chatID, chatItem]) => ({
          ...chatItem!
        })).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())}
        contentInsetAdjustmentBehavior="automatic"
        renderItem={({ item, index }) => (
          <Animated.View>
            <ChatRow
              key={item.id}
              {...item!}
              chatTitle={getChatTitle(item, user)}
              iconUrl={getChatIcon(item, user)}
              onSingleDelete={() => deleteSingleChat(item.id!)}
              onCheckChat={(chatID, checked) => {
                if (checked) {
                  // add to selectedChats
                  setSelectedChats((prev) => [...prev, chatID])
                } else {
                  // remove from selectedChats
                  setSelectedChats((prev) => prev.filter((id) => id !== chatID))
                }
              }}
              isEdit={isEdit}
            />
          </Animated.View>
        )}
        style={{ backgroundColor: colors.background }}
        ItemSeparatorComponent={() => (
          <View style={{ marginLeft: 90, height: StyleSheet.hairlineWidth, backgroundColor: colors.borderColor }} />
        )}
        contentContainerStyle={{ paddingBottom: tabBarHeight! + 20 }}
        refreshing={loading}
        onRefresh={refreshData}
        progressViewOffset={2 * (top + 40)}
        keyExtractor={(item) => item.id}
        itemLayoutAnimation={LinearTransition.duration(300)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  navBarTitle: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  title: {
    fontSize: 32,
    fontWeight: '700'
  },
  leftHeader: {
    left: 4,
    bottom: 4
  }
})

export default ChatScreen
