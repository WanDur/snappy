import React, { useMemo, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  SafeAreaView
} from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import { useTheme, useFriendStore, usePhotoStore } from '@/hooks'
import { Friend, FriendStatus } from '@/types/friend.types'
import { Photo } from '@/types/photo.types'
import { Avatar } from '@/components/Avatar'

/**
 * TaggedUserModal
 * ----------------
 * Opens from ViewPhotoModal with router params { photoId }
 * – Shows a searchable list of friends that can be tagged
 * – Commits the chosen `taggedUserIds` back to Zustand on **Save**
 *
 * 🔗  UI-only update — render logic untouched.
 */
const TaggedUserModal = () => {
  const { colors } = useTheme()
  /* ---------------- ROUTER PARAMS ---------------- */
  const { photoId } = useLocalSearchParams<{ photoId: string }>()
  const router = useRouter()

  /* ---------------- RAW DATA ---------------- */
  const allFriends = useFriendStore((s) => s.friends) as Friend[]

  // Locate the single photo regardless of owner
  const photo: Photo | undefined = useMemo(() => {
    const map = usePhotoStore.getState().photoMap as Record<string, Photo[]>
    for (const list of Object.values(map)) {
      const found = list.find((p) => p.id === photoId)
      if (found) return found
    }
    return undefined
  }, [photoId])

  /* ---------------- LOCAL STATE ---------------- */
  const [search, setSearch] = useState('')
  const [taggedIds, setTaggedIds] = useState<string[]>(photo?.taggedUserIds ?? [])

  /* ---------------- MEMO ---------------- */
  const filteredFriends = useMemo(() => {
    const accepted = allFriends.filter((f) => f.type === FriendStatus.FRIEND)
    const q = search.trim().toLowerCase()
    if (!q) return accepted
    return accepted.filter((f) => f.name.toLowerCase().includes(q) || f.username.toLowerCase().includes(q))
  }, [allFriends, search])

  /* ---------------- HANDLERS ---------------- */
  const toggleTag = (id: string) => {
    setTaggedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSave = () => {
    if (!photo) {
      router.back()
      return
    }

    // optimistic local update
    usePhotoStore.setState((draft: any) => {
      const p: Photo | undefined = draft.photoMap[photo.userId]?.find((x: Photo) => x.id === photoId)
      if (p) p.taggedUserIds = taggedIds
    })

    router.back()
  }

  /* ---------------- RENDER ---------------- */
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Tag Friends',
          headerTintColor: '#1e90ff',
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: '#fff', fontWeight: '600' },
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity activeOpacity={0.7} onPress={handleSave}>
              <Text style={styles.save}>Save</Text>
            </TouchableOpacity>
          )
        }}
      />

      <View style={{ flex: 1, paddingTop: 16 }}>
        {/* ------------ SEARCH BAR ------------ */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends"
            placeholderTextColor="#666"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>

        {/* ------------ FRIEND LIST ------------ */}
        <FlatList
          style={[styles.list, { backgroundColor: colors.background }]}
          data={filteredFriends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const tagged = taggedIds.includes(item.id)
            return (
              <TouchableOpacity
                style={[styles.row, { backgroundColor: colors.secondaryBg }, tagged && { backgroundColor: colors.green }]}
                activeOpacity={0.8}
                onPress={() => toggleTag(item.id)}
              >
                <Avatar
                  size={44}
                  iconUrl={item.avatar}
                  username={item.username}
                  style={styles.avatar}
                />
                <View style={styles.info}>
                  <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.username, { color: colors.text }]}>@{item.username}</Text>
                </View>
                <View style={[styles.tagBtn, tagged ? styles.tagBtnActive : styles.tagBtnInactive]}>
                  <Ionicons name={tagged ? 'checkmark' : 'add'} size={16} color={tagged ? '#fff' : '#eee'} />
                </View>
              </TouchableOpacity>
            )
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  )
}

export default TaggedUserModal

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  save: {
    color: '#1e90ff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12
  },
  /* SEARCH BAR */
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
    marginTop: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: 28,
    paddingHorizontal: 14,
    height: 44
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    marginLeft: 8,
    fontSize: 15
  },
  /* LIST */
  list: {
    flex: 1,
    paddingTop: 60
  },
  /* FRIEND ROW */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14
  },
  rowActive: {
    backgroundColor: '#253a27'
  },
  separator: {
    height: 8
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
    backgroundColor: '#333'
  },
  info: {
    flex: 1
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  username: {
    color: '#8a8a8e',
    fontSize: 13,
    marginTop: 2
  },
  tagBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tagBtnActive: {
    backgroundColor: '#4caf50'
  },
  tagBtnInactive: {
    borderWidth: 1,
    borderColor: '#555'
  },
  listContent: {
    padding: 16,
    paddingBottom: 32
  }
})
