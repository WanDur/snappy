import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import Storage from 'expo-sqlite/kv-store'

import { User } from '@/types'

interface UserStore {
  /**
   * user data. string fields like id or name are empty if user not logged in
   */
  user: User
  /**
   * set when user is logged in
   */
  setUser: (user: User) => void

  updateUsername: (username: string) => void
  updateName: (name: string) => void
  updatePhone: (phone: string) => void
  updateAvatar: (avatar: string) => void
  updateTier: (tier: string) => void
  updateBio: (bio: string) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    immer<UserStore>((set, get) => ({
      user: {
        id: '',
        email: '',
        username: '',
        name: '',
        phone: '',
        iconUrl: '',
        bio: '',
        notificationTokens: [],
        tier: {},
        premiumExpireTime: undefined
      },

      setUser(user) {
        set((state) => {
          state.user = user
        })
      },

      updateUsername(username) {
        set((state) => {
          state.user.username = username
        })
      },

      updateName(name) {
        set((state) => {
          state.user.name = name
        })
      },

      updatePhone(phone) {
        set((state) => {
          state.user.phone = phone
        })
      },

      updateAvatar(avatar) {
        set((state) => {
          state.user.iconUrl = avatar
        })
      },

      updateTier(tier) {
        set((state) => {
          state.user.tier = tier
        })
      },

      updateBio(bio) {
        set((state) => {
          state.user.bio = bio
        })
      }
    })),
    { name: 'zustand-user', storage: createJSONStorage(() => Storage) }
  )
)
