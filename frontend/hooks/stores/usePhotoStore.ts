import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import Storage from "expo-sqlite/kv-store";
import { Photo, PhotoComment } from "@/types/photo.types";
/* ---------- domain types (minimal) ---------------------------- */

/* ---------- helpers ------------------------------------------ */
const isoWeek = (d: Date) => {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil((1 + (t.getTime() - yearStart.getTime()) / 86400000) / 7);
};
const weekKey = (d: Date) => `${d.getUTCFullYear()}-${isoWeek(d)}`;
/* cheap collision-safe id (no uuid needed) */
const id = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/* ---------- store shape -------------------------------------- */
interface State {
  /** uploaderId → photos they posted */
  photoMap: Record<string, Photo[]>;

  lastUpdate: number;

  setLastUpdate: (lastUpdate: number) => void;

  /* CRUD */
  addPhoto: (
    userId: string,
    data: {
      id: string;
      uri: string;
      caption?: string;
      taggedUserIds?: string[];
      timestamp: Date;
      location?: string;
      likes: string[];
    }
  ) => void;

  hasPhoto: (userId: string, photoId: string) => boolean;

  removePhoto: (userId: string, photoId: string) => void;

  getUserPhotos: (userId: string) => Photo[];

  getPhoto: (photoId: string) => Photo | undefined;

  /* social */

  updatePhotoDetails: (
    userId: string,
    photoId: string,
    caption?: string,
    taggedUserIds?: string[],
    likes?: string[],
    comments?: PhotoComment[]
  ) => void;

  toggleLike: (ownerId: string, photoId: string, byUserId: string) => void;

  addComment: (
    id: string,
    photoId: string,
    byUserId: string,
    message: string,
    timestamp: Date
  ) => void;

  deleteComment: (photoId: string, commentId: string) => void;

  /* local feed helper (you can replace with real API later) */
  fetchFeed: (friendIds: string[]) => Photo[];

  clearPhotos: () => void;
}

/* ---------- the store ---------------------------------------- */
export const usePhotoStore = create<State>()(
  persist(
    immer<State>((set, get) => ({
      photoMap: {},

      lastUpdate: 0,

      setLastUpdate(lastUpdate: number) {
        set({ lastUpdate });
      },

      /* ==== ADD PHOTO ===================================================== */
      addPhoto(
        userId,
        { id, uri, caption, taggedUserIds = [], timestamp = new Date() }
      ) {
        set((draft) => {
          const list = draft.photoMap[userId] ?? (draft.photoMap[userId] = []);
          if (list.some((p) => p.id === id)) {
            return;
          }
          /* create new photo */
          const p: Photo = {
            id,
            userId,
            timestamp,
            url: uri,
            caption,
            taggedUserIds: taggedUserIds,
            likes: [],
            comments: [],
            year: timestamp.getUTCFullYear(),
            week: isoWeek(timestamp),
          };

          list.push(p);
          list.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          /* re-index JUST that ISO week */
          // const wk = weekKey(timestamp);
          // const weekBlock = list
          //   .filter((x) => weekKey(x.timestamp) === wk)
          //   .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

          // weekBlock.forEach((x, i) => {
          //   x.orderInWeek = i + 1;
          //   x.weekTotal = weekBlock.length;
          // });
        });
      },

      hasPhoto(userId, photoId) {
        return get().photoMap[userId]?.some((p) => p.id === photoId) ?? false;
      },

      /* ==== REMOVE PHOTO ================================================== */
      removePhoto(userId, photoId) {
        set((draft) => {
          const list = draft.photoMap[userId];
          if (!list) return;

          /* find week before deleting */
          const idx = list.findIndex((p) => p.id === photoId);
          if (idx === -1) return;

          list.splice(idx, 1);
          if (!list.length) {
            delete draft.photoMap[userId];
            return;
          } else {
            list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          }
        });
      },

      getUserPhotos(userId) {
        return get().photoMap[userId] ?? [];
      },

      getPhoto(photoId) {
        return Object.values(get().photoMap)
          .flat()
          .find((p) => p.id === photoId);
      },

      updatePhotoDetails(
        userId,
        photoId,
        caption,
        taggedUserIds,
        likes,
        comments
      ) {
        set((draft) => {
          const photo = draft.photoMap[userId]?.find((p) => p.id === photoId);
          if (!photo) return;
          if (caption) {
            photo.caption = caption;
          }
          if (taggedUserIds) {
            photo.taggedUserIds = taggedUserIds;
          }
          if (likes) {
            photo.likes = likes;
          }
          if (comments) {
            photo.comments = comments;
          }
        });
      },

      /* ==== TOGGLE LIKE =================================================== */
      toggleLike(ownerId, photoId, byUserId) {
        set((draft) => {
          const photo = draft.photoMap[ownerId]?.find((p) => p.id === photoId);
          if (!photo) return;
          const i = photo.likes.indexOf(byUserId);
          i === -1 ? photo.likes.push(byUserId) : photo.likes.splice(i, 1);
        });
      },

      /* ==== ADD COMMENT =================================================== */
      addComment(id, photoId, byUserId, message, timestamp) {
        if (!message.trim()) return;
        set((draft) => {
          const photo = Object.values(draft.photoMap)
            .flat()
            .find((p) => p.id === photoId);
          if (!photo) return;
          photo.comments.push({
            id: id,
            userId: byUserId,
            message,
            timestamp,
          });
        });
      },

      deleteComment(photoId, commentId) {
        set((draft) => {
          const photo = Object.values(draft.photoMap)
            .flat()
            .find((p) => p.id === photoId);
          if (!photo) return;
          photo.comments = photo.comments.filter((c) => c.id !== commentId);
        });
      },

      /* ==== LOCAL FEED (stub) ============================================ */
      fetchFeed(friendIds) {
        const map = get().photoMap;
        return friendIds
          .flatMap((fid) => map[fid] ?? [])
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      },

      clearPhotos() {
        set({ photoMap: {} });
      },
    })),
    {
      name: "zustand-photo",
      storage: createJSONStorage(() => Storage),
    }
  )
);
