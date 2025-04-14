import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Album } from '@/types'

interface AlbumStore {
  albumList: Album[]
  addAlbum: (album: Album) => void
  editAlbum: (id: string, updatedAlbum: Partial<Album>) => void
  removeAlbum: (id: string) => void
}

export const useAlbumStore = create<AlbumStore>()(
  persist(
    immer<AlbumStore>((set, get) => ({
      albumList: [],

      addAlbum: (album) => {
        set((state) => {
          state.albumList.push(album)
        })
      },
      editAlbum: (id, updatedAlbum) => {
        set((state) => {
          const index = state.albumList.findIndex((album) => album.id === id)
          if (index !== -1) {
            state.albumList[index] = { ...state.albumList[index], ...updatedAlbum }
          }
        })
      },
      removeAlbum: (id) => {
        set((state) => {
          state.albumList = state.albumList.filter((album) => album.id !== id)
        })
      }
    })),
    { name: 'zustand-album', storage: createJSONStorage(() => AsyncStorage) }
  )
)
