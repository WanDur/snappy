import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import Animated, { LinearTransition } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Crypto from 'expo-crypto'
import { Stack } from 'expo-router'

import { Themed } from '@/components'
import { ChatRow } from '@/components/chat'
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground'
import { useChatStore, useProfileStore, useStorage, useTheme } from '@/hooks'
import { ChatItem } from '@/types'
// import { useSession } from '@/contexts/auth'
// import { FetchNewMessageResponse } from '@/types/chats.type'
// import { useSync } from '@/hooks/useSync'

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

const companyNames = [
  'Tech Solutions',
  'Innovative Systems',
  'Global Enterprises',
  'NextGen Technologies',
  'Creative Minds',
  'Future Vision',
  'Dynamic Corp',
  'Elite Software',
  'Prime Innovations',
  'Pioneer Tech',
  'Bright Future',
  'Visionary Labs',
  'Synergy Solutions'
]

const jobTitles = [
  'Marketing Manager',
  'Software Engineer',
  'Product Manager',
  'Sales Executive',
  'HR Specialist',
  'Data Analyst',
  'UX Designer',
  'Project Coordinator',
  'Business Analyst',
  'Operations Manager',
  'Financial Analyst',
  'Customer Support',
  'IT Specialist'
]

const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
const getRandomDate = () => new Date(Date.now() - Math.floor(Math.random() * 10000000000))

export const ChatScreen = () => {
  // const session = useSession()

  const { colors, theme } = useTheme()
  const { top } = useSafeAreaInsets()
  const tabBarHeight = useBottomTabOverflow()

  const { deleteItemFromStorage } = useStorage()
  const {
    chats,
    allChatID,
    hasChat,
    getLastFetchTime,
    updateLastFetchTime,
    getChat,
    setChatInfo,
    addChat,
    addMessage,
    updateLastMessageTime,
    deleteChat,
    addUnreadCount
  } = useChatStore()
  const { profile } = useProfileStore()
  //const { syncChat } = useSync()

  const [isEdit, setIsEdit] = useState(false)
  const [selectedChats, setSelectedChats] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [allChats, setAllChats] = useState<ChatItem[]>([])

  const fetchAllChatInfo = async () => {
    return
    for (const chatId of allChatID) {
      const infoRes = await session.apiWithToken.get(`/panda/chat/${chatId}/info`)
      let chatTitle, chatSubtitle
      let iconUrl = ''
      if (infoRes.data.employerId === profile.user._id) {
        const { firstName, lastName } = infoRes.data.providerRealName
        chatTitle = `${firstName} ${lastName}`
        chatSubtitle = ''
        iconUrl = infoRes.data.providerIconUrl
      } else if (infoRes.data.providerId === profile.user._id) {
        const { firstName, lastName } = infoRes.data.employerRealName
        chatTitle = `${firstName} ${lastName}`
        chatSubtitle = infoRes.data.employerCompanyName || ''
        iconUrl = infoRes.data.employerIconUrl
      }
      setChatInfo(chatId, chatTitle, chatSubtitle, iconUrl)
    }
  }

  const refreshData = async () => {
    setLoading(true)
    await fetchAllChatInfo()
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    refreshData()
    // syncChat()
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
              onPress={() =>
                addChat({
                  chatSubtitle: getRandomItem(companyNames),
                  chatTitle: getRandomItem(jobTitles),
                  initialDate: getRandomDate(),
                  unreadCount: Math.floor(Math.random() * 6),
                  iconUrl: avatars[Math.floor(Math.random() * avatars.length)],
                  lastMessageTime: getRandomDate(),
                  id: `${Crypto.randomUUID().substring(0, 18)}`,
                  messages: []
                })
              }
            >
              <Themed.Text type="link">$add-chat</Themed.Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (isEdit) {
                  deleteMultiChat()
                } else {
                  setIsEdit(!isEdit)
                }
              }}
            >
              <Themed.Text type="link">
                {isEdit ? (selectedChats.length > 0 ? `Delete ${selectedChats.length}` : 'Done') : 'Edit'}
              </Themed.Text>
            </TouchableOpacity>
          )
        }}
      />
      <Animated.FlatList
        data={Object.entries(chats).map(([chatID, chatItem]) => ({
          ...chatItem!
        }))}
        contentInsetAdjustmentBehavior="automatic"
        renderItem={({ item, index }) => (
          <Animated.View>
            <ChatRow
              key={item.id}
              {...item!}
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
