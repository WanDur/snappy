import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import Storage from 'expo-sqlite/kv-store'

/* ---------- domain types (minimal) ---------------------------- */
export interface PhotoComment {
  id: string
  userId: string
  message: string
  timestamp: string // ISO-8601
}

export interface Photo {
  photoId: string
  userId: string
  timestamp: string // ISO-8601
  url: string
  caption?: string
  taggedUserIds: string[]
  likes: string[]
  comments: PhotoComment[]
  /* local-only helpers */
  orderInWeek: number
  weekTotal: number
}

/* ---------- helpers ------------------------------------------ */
const isoWeek = (d: Date) => {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1))
  return Math.ceil((1 + (t.getTime() - yearStart.getTime()) / 86400000) / 7)
}
const weekKey = (d: Date) => `${d.getUTCFullYear()}-${isoWeek(d)}`
/* cheap collision-safe id (no uuid needed) */
const id = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

/* ---------- store shape -------------------------------------- */
interface State {
  /** uploaderId → photos they posted */
  photoMap: Record<string, Photo[]>

  /* CRUD */
  addPhoto: (
    userId: string,
    data: {
      uri: string
      caption?: string
      tags?: string[]
      when?: Date
    }
  ) => void
  removePhoto: (userId: string, photoId: string) => void

  /* social */
  toggleLike: (ownerId: string, photoId: string, byUserId: string) => void
  addComment: (ownerId: string, photoId: string, byUserId: string, message: string) => void

  /* local feed helper (you can replace with real API later) */
  fetchFeed: (friendIds: string[]) => Photo[]
}

/* ---------- the store ---------------------------------------- */
export const usePhotoStore = create<State>()(
  persist(
    immer<State>((set, get) => ({
      photoMap: {},

      /* ==== ADD PHOTO ===================================================== */
      addPhoto(userId, { uri, caption, tags = [], when = new Date() }) {
        set((draft) => {
          const list = draft.photoMap[userId] ?? (draft.photoMap[userId] = [])

          /* create new photo */
          const p: Photo = {
            photoId: id(),
            userId,
            timestamp: when.toISOString(),
            url: uri,
            caption,
            taggedUserIds: tags,
            likes: [],
            comments: [],
            orderInWeek: 0,
            weekTotal: 0
          }
          list.push(p)

          /* re-index JUST that ISO week */
          const wk = weekKey(when)
          const weekBlock = list
            .filter((x) => weekKey(new Date(x.timestamp)) === wk)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

          weekBlock.forEach((x, i) => {
            x.orderInWeek = i + 1
            x.weekTotal = weekBlock.length
          })
        })
      },

      /* ==== REMOVE PHOTO ================================================== */
      removePhoto(userId, photoId) {
        set((draft) => {
          const list = draft.photoMap[userId]
          if (!list) return

          /* find week before deleting */
          const idx = list.findIndex((p) => p.photoId === photoId)
          if (idx === -1) return
          const removedWeek = weekKey(new Date(list[idx].timestamp))

          list.splice(idx, 1)
          if (!list.length) {
            delete draft.photoMap[userId]
            return
          }

          /* re-index the week that changed */
          const weekBlock = list
            .filter((x) => weekKey(new Date(x.timestamp)) === removedWeek)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

          weekBlock.forEach((x, i) => {
            x.orderInWeek = i + 1
            x.weekTotal = weekBlock.length
          })
        })
      },

      /* ==== TOGGLE LIKE =================================================== */
      toggleLike(ownerId, photoId, byUserId) {
        set((draft) => {
          const photo = draft.photoMap[ownerId]?.find((p) => p.photoId === photoId)
          if (!photo) return
          const i = photo.likes.indexOf(byUserId)
          i === -1 ? photo.likes.push(byUserId) : photo.likes.splice(i, 1)
        })
      },

      /* ==== ADD COMMENT =================================================== */
      addComment(ownerId, photoId, byUserId, message) {
        if (!message.trim()) return
        set((draft) => {
          const photo = draft.photoMap[ownerId]?.find((p) => p.photoId === photoId)
          if (!photo) return
          photo.comments.push({
            id: id(),
            userId: byUserId,
            message,
            timestamp: new Date().toISOString()
          })
        })
      },

      /* ==== LOCAL FEED (stub) ============================================ */
      fetchFeed(friendIds) {
        const map = get().photoMap
        return friendIds
          .flatMap((fid) => map[fid] ?? [])
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      }
    })),
    {
      name: 'zustand-photo',
      storage: createJSONStorage(() => Storage)
    }
  )
)
