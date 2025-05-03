import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import Storage from 'expo-sqlite/kv-store'

import { Friend } from '@/types'

interface FriendStore {
  friends: Friend[]
  addFriend: (friend: Friend) => void
  getFriend: (id: string) => Friend | undefined
  removeFriend: (id: string) => void
  handleRequest: (id: string, accept: boolean) => void
}

export const useFriendStore = create<FriendStore>()(
  persist(
    immer<FriendStore>((set, get) => ({
      friends: [],
      addFriend: (friend) => {
        set((state) => {
          const existingFriend = state.friends.find((f) => f.id === friend.id)
          if (!existingFriend) {
            state.friends.push(friend)
          }
        })
      },
      getFriend: (id) => {
        return get().friends.find((friend) => friend.id === id)
      },
      removeFriend: (id) => {
        set((state) => {
          state.friends = state.friends.filter((friend) => friend.id !== id)
        })
      },
      handleRequest: (id, accept) => {
        set((state) => {
          const friend = state.friends.find((f) => f.id === id)
          if (friend) {
            if (accept) {
              friend.type = 'friend'
            } else {
              state.friends = state.friends.filter((f) => f.id !== id)
            }
          }
        })
      }
    })),
    { name: 'zustand-friend', storage: createJSONStorage(() => Storage) }
  )
)
