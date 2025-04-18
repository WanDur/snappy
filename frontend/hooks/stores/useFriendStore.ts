import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface FriendStore {
  removeAlbum: (id: string) => void
}

export const useFriendStore = create<FriendStore>()(
  persist(
    immer<FriendStore>((set, get) => ({
      removeAlbum: (id) => {
        set((state) => {})
      }
    })),
    { name: 'zustand-friend', storage: createJSONStorage(() => AsyncStorage) }
  )
)
