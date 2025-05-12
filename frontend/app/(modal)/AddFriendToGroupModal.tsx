import { useState, useRef, useEffect, useMemo } from 'react'
import { View, StyleSheet, SectionList, Image, TouchableOpacity, Animated, ListRenderItem } from 'react-native'
import { useHeaderHeight } from '@react-navigation/elements'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'

import { Themed } from '@/components'
import { Stack, Form, ContentUnavailable } from '@/components/router-form'
import { HeaderText } from '@/components/ui'
import BouncyCheckbox from '@/components/react-native-bouncy-checkbox'
import { Constants } from '@/constants'
import { useFriendStore, useTheme } from '@/hooks'
import { Friend } from '@/types'
import { useSettings } from '@/contexts'
import { Avatar } from '@/components/Avatar'

// remove from Omit if more fields are needed
interface TFriend
  extends Omit<Friend, 'albumList' | 'type' | 'lastActive' | 'mutualFriends' | 'photoList'> {}

interface FriendListGroup {
  title: string
  data: TFriend[]
}

const AddFriendToGroupScreen = () => {
  const { type } = useLocalSearchParams<{ type: string }>()
  const { colors } = useTheme()
  const HEADER_HEIGHT = useHeaderHeight()
  const { getAcceptedFriends } = useFriendStore()
  const { setSetting } = useSettings()

  const [selectedFriends, setSelectedFriends] = useState<TFriend[]>([])
  const animValue = useRef(new Animated.Value(0)).current

  const friends = getAcceptedFriends()

  const toggleSelection = (friend: TFriend) => {
    setSelectedFriends((prev) => {
      const exists = prev.find((f) => f.id === friend.id)
      if (exists) {
        return prev.filter((f) => f.id !== friend.id)
      }
      return [...prev, friend]
    })
  }

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: selectedFriends.length > 0 ? 1 : 0,
      duration: 300,
      useNativeDriver: false
    }).start()
  }, [selectedFriends])

  const headerHeight = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, HEADER_HEIGHT + 32]
  })

  // Group friends by first letter
  const groupedFriends = useMemo<FriendListGroup[]>(() => {
    const groups: Record<string, TFriend[]> = {}
    friends.forEach((f) => {
      const letter = f.name[0].toUpperCase()
      if (!groups[letter]) {
        groups[letter] = []
      }
      groups[letter].push(f)
    })

    return Object.keys(groups)
      .sort()
      .map((letter) => ({ title: letter, data: groups[letter] }))
  }, [friends])

  const renderFriend: ListRenderItem<TFriend> = ({ item, index }) => (
    <Themed.View key={index} style={styles.friendRow} lightColor="#fafafa">
      <Avatar username={item.username} iconUrl={item.avatar} size={40} style={{ marginHorizontal: 10 }} />
      <Themed.Text style={{ fontSize: 16 }}>{item.name}</Themed.Text>
      <View style={{ position: 'absolute' }}>
        <BouncyCheckbox
          style={{ width: '100%', paddingVertical: 4, paddingLeft: Constants.screenWidth - 50 }}
          isChecked={!!selectedFriends.find((f) => f.id === item.id)}
          fillColor="#4CAF50"
          iconStyle={styles.checkboxIcon}
          onPress={() => toggleSelection(item)}
        />
      </View>
    </Themed.View>
  )

  const handleDone = () => {
    if (type == 'album') {
      console.log(`Selected friends for album: ${selectedFriends.map((f) => f.name)}`)
      setSetting(
        'friendsToAlbum',
        selectedFriends.map((f) => f.id)
      )
    } else if (type == 'chat') {
      console.log(`Selected friends for chat: ${selectedFriends.map((f) => f.name)}`)
      setSetting(
        'friendsToChat',
        selectedFriends.map((f) => f.id)
      )
    }
    router.back()
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: 'Add friend',
          headerTransparent: false,
          headerLargeTitleShadowVisible: true,
          headerLeft: () => <HeaderText text="Cancel" textProps={{ state: true }} />,
          headerRight: () => (
            <HeaderText text="Done" textProps={{ state: selectedFriends.length > 0 }} onPress={handleDone} />
          )
        }}
      />
      <Animated.View
        style={{
          height: headerHeight,
          borderBottomWidth: selectedFriends.length > 0 ? StyleSheet.hairlineWidth : 0,
          borderBottomColor: colors.borderColor
        }}
      >
        <Themed.ScrollView style={{ padding: 16 }} showsHorizontalScrollIndicator={false} horizontal>
          {selectedFriends.map((item, index) => (
            <View style={styles.selectedFriend} key={index}>
              <Avatar username={item.username} iconUrl={item.avatar} size={60} />
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: colors.background }]}
                onPress={() => toggleSelection(item)}
              >
                <Ionicons name="close-circle" size={26} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </Themed.ScrollView>
      </Animated.View>

      <SectionList
        sections={groupedFriends}
        keyExtractor={(item) => item.id}
        renderItem={renderFriend}
        renderSectionHeader={({ section }) => (
          <Themed.View style={[styles.sectionHeader]} lightColor="white" darkColor="black">
            <Themed.Text style={styles.sectionHeaderText}>{section.title}</Themed.Text>
          </Themed.View>
        )}
        ListEmptyComponent={() => (
          <Form.Section style={{ marginTop: 20 }}>
            <ContentUnavailable
              title="Connect with Friends"
              systemImage="person.2"
              description="You haven't added any friends yet. Explore suggested friends or search to start connecting!"
            />
          </Form.Section>
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
        stickySectionHeadersEnabled
        ItemSeparatorComponent={() => <Themed.View type="divider" />}
        style={{ backgroundColor: colors.background }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  selectedFriend: {
    marginRight: 14,
    alignItems: 'center'
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: -8,
    borderRadius: 20
  },
  sectionHeader: {
    paddingVertical: 6,
    paddingHorizontal: 10
  },
  sectionHeaderText: {
    fontWeight: 'bold',
    fontSize: 16
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10
  },
  checkboxIcon: {
    borderColor: '#4CAF50'
  }
})

export default AddFriendToGroupScreen
