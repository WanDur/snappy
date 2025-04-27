/**
 * This hook can be used to store any ungrouped data in local storage.
 * It can be used like Storage, but with a more convenient API managed by Zustand.
 */
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import Storage from 'expo-sqlite/kv-store'

interface StorageStore {
  savedInterests: number[]
  saveInterests: (interests: number[]) => void

  savedJobs: string[]
  setSavedJobs: (jobIds: string[]) => void
  addSavedJob: (jobId: string | string[]) => void
  removeSavedJob: (jobId: string | string[]) => void
}

export const useStorageStore = create<StorageStore>()(
  persist(
    immer<StorageStore>((set, get) => ({
      savedInterests: [],
      saveInterests(interests) {
        set((state) => {
          state.savedInterests = interests
        })
      },

      savedJobs: [],

      setSavedJobs(jobIds) {
        set((state) => {
          state.savedJobs = jobIds
        })
      },

      addSavedJob(jobId) {
        set((state) => {
          state.savedJobs = Array.from(new Set([...state.savedJobs, ...(Array.isArray(jobId) ? jobId : [jobId])]))
        })
      },
      removeSavedJob(jobId) {
        set((state) => {
          state.savedJobs = state.savedJobs.filter((id) => (Array.isArray(jobId) ? !jobId.includes(id) : id !== jobId))
        })
      }
    })),
    { name: 'zustand-storage', storage: createJSONStorage(() => Storage) }
  )
)
