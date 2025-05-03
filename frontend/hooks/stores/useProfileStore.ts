import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import Storage from 'expo-sqlite/kv-store'

import { ProfileData, User } from '@/types'

const DEFAULT_PROFILE: ProfileData = {
  user: { _id: '', realName: { firstName: '', lastName: '', honorific: '' }, username: '' },
  aboutDesc: '',
  education: [],
  language: { primary: '' },
  skills: [],
  workExp: []
}

interface ProfileStore {
  profile: ProfileData
  getProfile: () => ProfileData
  updateProfile: (newProfile: ProfileData) => void

  updateUser: (user: User) => void
  updateAvatar: (avatar: string) => void
  updateAbout: (text: string) => void
  updateFirstName: (name: string) => void
  updateLastName: (name: string) => void
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    immer<ProfileStore>((set, get) => ({
      profile: DEFAULT_PROFILE,

      getProfile() {
        return get().profile
      },

      updateProfile(newProfile) {
        set((state) => {
          state.profile = newProfile
        })
      },

      updateUser(user) {
        set((state) => {
          state.profile.user = user
        })
      },

      updateAvatar(avatar) {
        set((state) => {
          state.profile.user.avatar = avatar
        })
      },

      updateAbout(text) {
        set((state) => {
          state.profile.aboutDesc = text
        })
      },

      updateFirstName(name) {
        set((state) => {
          state.profile.user.realName!.firstName = name
        })
      },

      updateLastName(name) {
        set((state) => {
          state.profile.user.realName!.lastName = name
        })
      }
    })),
    { name: 'zustand-profile', storage: createJSONStorage(() => Storage) }
  )
)
