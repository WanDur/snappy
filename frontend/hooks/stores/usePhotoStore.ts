import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import * as Crypto from 'expo-crypto' // same lib you use elsewhere
import { Photo } from '@/types/photo.types'

/* ----------------------------------------------------------
   ISO-week helpers (identical to the ones in index-home.tsx)
----------------------------------------------------------- */
const getISOWeek = (d: Date): number => {
  const copy = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNr = copy.getUTCDay() || 7
  copy.setUTCDate(copy.getUTCDate() + 4 - dayNr)
  const yearStart = new Date(Date.UTC(copy.getUTCFullYear(), 0, 1))
  return Math.ceil(((copy.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}
const weekKey = (d: Date) => `${d.getUTCFullYear()}-${getISOWeek(d)}` // “2025-19”

/* ----------------------------------------------------------
   Store shape
----------------------------------------------------------- */
interface PhotoState {
  /**  Main store:   friendId  →  Photo[]  */
  photoMap: Record<string, Photo[]>

  /*  Actions  */
  addPhoto: (
    friendId: string,
    data: {
      uri: string
      caption?: string
      location?: Photo['location']
      when?: Date // optional, default = now()
    }
  ) => void

  removePhoto: (friendId: string, photoId: string) => void
  clearAll: () => void
}

export const usePhotoStore = create<PhotoState>()(
  persist(
    (set, get) => ({
      photoMap: {},

      /* ---------- addPhoto ---------- */
      addPhoto(friendId, { uri, caption, location, when = new Date() }) {
        const map = { ...get().photoMap }
        const list = map[friendId] ? [...map[friendId]] : []

        // 1.  Build raw photo
        const newPhoto: Photo = {
          photoId: uuidv4(), // you already depend on uuid in album store
          uri,
          caption,
          location,
          uploadedAt: when.toISOString(),
          orderInWeek: 0, // filled just below
          weekTotal: 0
        }

        // 2.  Insert & re-index the current ISO-week block
        list.push(newPhoto)
        const wk = weekKey(when)

        const weekPhotos = list.filter((p) => weekKey(new Date(p.uploadedAt)) === wk)
        weekPhotos.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime())

        weekPhotos.forEach((p, i) => {
          p.orderInWeek = i + 1
          p.weekTotal = weekPhotos.length
        })

        map[friendId] = list
        set({ photoMap: map })
      },

      /* ---------- removePhoto ---------- */
      removePhoto(friendId, photoId) {
        const map = { ...get().photoMap }
        const list = map[friendId]?.filter((p) => p.photoId !== photoId) ?? []
        if (!list.length) {
          delete map[friendId]
          return set({ photoMap: map })
        }

        // Re-index week counters for the week the removed photo belonged to
        const removedWeek = weekKey(new Date(get().photoMap[friendId].find((p) => p.photoId === photoId)!.uploadedAt))
        const weekPhotos = list.filter((p) => weekKey(new Date(p.uploadedAt)) === removedWeek)
        weekPhotos
          .sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime())
          .forEach((p, i) => {
            p.orderInWeek = i + 1
            p.weekTotal = weekPhotos.length
          })

        map[friendId] = list
        set({ photoMap: map })
      },

      /* ---------- clearAll (dev reset) ---------- */
      clearAll() {
        set({ photoMap: {} })
      }
    }),
    {
      name: 'zustand-photo', // AsyncStorage / MMKV key
      version: 1
    }
  )
)
