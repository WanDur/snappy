import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Photo, PhotoComment } from '@/types/photo.types'

/* ---------- helpers ---------- */
const isoWeek = (d: Date) => {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 864e5 + 1) / 7)
}
const weekKey = (d: Date) => `${d.getUTCFullYear()}-${isoWeek(d)}`

/* ---------- store ---------- */
interface PhotoState {
  /** userId → photos they posted */
  photoMap: Record<string, Photo[]>

  /* crud */
  addPhoto: (
    userId: string,
    data: {
      uri: string
      caption?: string
      tags?: string[]
      location?: Photo['location']
      when?: Date
    }
  ) => void
  removePhoto: (userId: string, photoId: string) => void

  /* social */
  toggleLike: (photoOwnerId: string, photoId: string, byUserId: string) => void
  addComment: (photoOwnerId: string, photoId: string, byUserId: string, message: string) => void

  /* convenience */
  fetchFeed: (friendIds: string[]) => Photo[] // local-only stub
}

export const usePhotoStore = create<PhotoState>()(
  persist(
    (set, get) => ({
      photoMap: {},

      /* ------------------- addPhoto ------------------- */
      addPhoto(userId, { uri, caption, tags = [], location, when = new Date() }) {
        const map = { ...get().photoMap }
        const list = map[userId] ? [...map[userId]] : []

        const newPhoto: Photo = {
          photoId: uuid(),
          userId,
          timestamp: when.toISOString(),
          url: uri,
          caption,
          taggedUserIds: tags,
          likes: [],
          comments: [],
          location,
          orderInWeek: 0, // filled just below
          weekTotal: 0
        }

        list.push(newPhoto)

        /* re-index just the week that was touched */
        const wk = weekKey(when)
        const weekSet = list
          .filter((p) => weekKey(new Date(p.timestamp)) === wk)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

        weekSet.forEach((p, i) => {
          p.orderInWeek = i + 1
          p.weekTotal = weekSet.length
        })

        map[userId] = list
        set({ photoMap: map })
      },

      /* ------------------- removePhoto ------------------- */
      removePhoto(userId, photoId) {
        const map = { ...get().photoMap }
        const list = map[userId]?.filter((p) => p.photoId !== photoId) ?? []
        if (!list.length) {
          delete map[userId]
          return set({ photoMap: map })
        }

        /* re-index the affected week */
        const removedWeek = weekKey(new Date(get().photoMap[userId].find((p) => p.photoId === photoId)!.timestamp))
        const wkPhotos = list.filter((p) => weekKey(new Date(p.timestamp)) === removedWeek)
        wkPhotos
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
          .forEach((p, i) => {
            p.orderInWeek = i + 1
            p.weekTotal = wkPhotos.length
          })

        map[userId] = list
        set({ photoMap: map })
      },

      /* ------------------- toggleLike ------------------- */
      toggleLike(photoOwnerId, photoId, byUserId) {
        const map = { ...get().photoMap }
        const photo = map[photoOwnerId]?.find((p) => p.photoId === photoId)
        if (!photo) return

        const i = photo.likes.indexOf(byUserId)
        if (i === -1) photo.likes.push(byUserId)
        else photo.likes.splice(i, 1)

        set({ photoMap: map })
      },

      /* ------------------- addComment ------------------- */
      addComment(photoOwnerId, photoId, byUserId, message) {
        if (!message.trim()) return
        const map = { ...get().photoMap }
        const photo = map[photoOwnerId]?.find((p) => p.photoId === photoId)
        if (!photo) return

        const comment: PhotoComment = {
          id: uuid(),
          userId: byUserId,
          message,
          timestamp: new Date().toISOString()
        }
        photo.comments.push(comment)
        set({ photoMap: map })
      },

      /* ------------------- fetchFeed (local stub) ------------------- */
      fetchFeed(friendIds) {
        const map = get().photoMap
        return friendIds
          .flatMap((fid) => map[fid] ?? [])
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      }
    }),
    { name: 'zustand-photos-v2', version: 1 }
  )
)
