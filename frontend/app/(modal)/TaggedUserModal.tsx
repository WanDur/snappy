import React, { useMemo, useState } from 'react'
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useFriendStore, usePhotoStore } from '@/hooks'
import { Ionicons } from '@expo/vector-icons'
import { Friend } from '@/types/friend.types'
import { Photo } from '@/types/photo.types'

/**
 * TaggedUserModal
 * ----------------
 * Opened from ViewPhotoModal with router params { photoId }
 * – Shows a searchable list of friends that can be tagged
 * – Commits the chosen `taggedUserIds` back to Zustand on **Save**
 */

const TaggedUserModal = () => {
  /* --- router param --- */
  const { photoId } = useLocalSearchParams<{ photoId: string }>()
  const router = useRouter()

  /* --- data from stores --- */
  const friends = useFriendStore((s) => s.friends) as Friend[]

  /**
   * We need the *single* photo object regardless of owner.  Because the
   * store groups by ownerId, scan `photoMap` once – the cost is negligible
   * (you rarely keep > ~200 items locally).
   */
  const photo: Photo | undefined = useMemo(() => {
    const map = usePhotoStore.getState().photoMap as Record<string, Photo[]>
    for (const list of Object.values(map)) {
      const found = list.find((p) => p.id === photoId)
      if (found) return found
    }
    return undefined
  }, [photoId])

  /* ---------------- local state ---------------- */
  const [search, setSearch] = useState('')
  const [taggedIds, setTaggedIds] = useState<string[]>(photo?.taggedUserIds ?? [])

  /* filter friends by search query */
  const filteredFriends = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return friends
    return friends.filter((f) => f.name.toLowerCase().includes(q) || f.username.toLowerCase().includes(q))
  }, [friends, search])

  /* ------------- handlers ------------- */
  const toggleTag = (id: string) => {
    setTaggedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleSave = () => {
    if (!photo) {
      router.back()
      return
    }

    /* mutate the store directly via setState (Zustand pattern) */
    usePhotoStore.setState((draft: any) => {
      const p: Photo | undefined = draft.photoMap[photo.userId]?.find((x: Photo) => x.id === photoId)
      if (p) p.taggedUserIds = taggedIds
    })

    router.back()
  }

  /* ---------------- render ---------------- */
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: 'Tag friends',
          headerRight: () => (
            <TouchableOpacity activeOpacity={0.7} onPress={handleSave}>
              <Text style={styles.save}>Save</Text>
            </TouchableOpacity>
          )
        }}
      />

      {/* friend list */}
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const tagged = taggedIds.includes(item.id)
          return (
            <View style={styles.row}>
              <Image source={{ uri: item.avatar ?? 'https://placehold.co/64x64' }} style={styles.avatar} />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.username}>@{item.username}</Text>
              </View>
              <TouchableOpacity
                style={[styles.tagBtn, tagged && { backgroundColor: '#4CAF50' }]}
                onPress={() => toggleTag(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons name={tagged ? 'checkmark' : 'add'} size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )
        }}
        ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  )
}

export default TaggedUserModal

/* ---------------- styles ---------------- */
const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    flex: 1,
    backgroundColor: '#000'
  },
  save: {
    color: '#1e90ff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 22,
    paddingHorizontal: 12
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    paddingVertical: 6,
    marginLeft: 6
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  info: {
    flex: 1
  },
  name: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600'
  },
  username: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2
  },
  tagBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1e90ff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})
