import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import Storage from 'expo-sqlite/kv-store'
import { Album, Image } from '@/types'

interface AlbumStore {
  albumList: Album[]
  addAlbum: (album: Album) => void
  editAlbum: (id: string, updatedAlbum: Partial<Album>) => void
  getAlbum: (id: string) => Album | undefined
  removeAlbum: (id: string) => void

  addImage: (id: string, images: Image[]) => void
  removeImage: (id: string, photoIndex: number) => void
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
      getAlbum: (id) => {
        const album = get().albumList.find((album) => album.id === id)
        return album
      },
      removeAlbum: (id) => {
        set((state) => {
          state.albumList = state.albumList.filter((album) => album.id !== id)
        })
      },

      addImage: (id, images) => {
        set((state) => {
          const index = state.albumList.findIndex((album) => album.id === id)
          if (index !== -1) {
            const album = state.albumList[index]
            album.images.push(...images)

            if (album.coverImage === '') {
              album.coverImage = images[0].uri
            }
          }
        })
      },
      removeImage: (id, photoIndex) => {
        set((state) => {
          const index = state.albumList.findIndex((album) => album.id === id)
          if (index !== -1) {
            const album = state.albumList[index]
            album.images.splice(photoIndex, 1)

            if (album.images.length === 0) {
              album.coverImage = ''
            } else if (album.coverImage === album.images[photoIndex].uri) {
              album.coverImage = album.images[0].uri
            }
          }
        })
      }
    })),
    { name: 'zustand-album', storage: createJSONStorage(() => Storage) }
  )
)
