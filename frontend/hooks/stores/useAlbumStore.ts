import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import Storage from "expo-sqlite/kv-store";
import { Album, AlbumPhoto } from "@/types";

interface AlbumStore {
  albumList: Album[];
  addAlbum: (album: Album) => void;
  editAlbum: (id: string, updatedAlbum: Partial<Album>) => void;
  getAlbum: (id: string) => Album | undefined;
  hasAlbum: (id: string) => boolean;
  removeAlbum: (id: string) => void;
  clearAlbums: () => void;

  addImage: (id: string, images: AlbumPhoto[]) => void;
  removeImage: (id: string, photoIndex: number) => void;
}

export const useAlbumStore = create<AlbumStore>()(
  persist(
    immer<AlbumStore>((set, get) => ({
      albumList: [],

      addAlbum: (album) => {
        set((state) => {
          state.albumList.push(album);
        });
      },
      editAlbum: (id, updatedAlbum) => {
        set((state) => {
          const index = state.albumList.findIndex((album) => album.id === id);
          if (index !== -1) {
            state.albumList[index] = {
              ...state.albumList[index],
              ...updatedAlbum,
            };
          }
        });
      },
      getAlbum: (id) => {
        const album = get().albumList.find((album) => album.id === id);
        return album;
      },
      hasAlbum: (id) => {
        return get().albumList.some((album) => album.id === id);
      },
      removeAlbum: (id) => {
        set((state) => {
          state.albumList = state.albumList.filter((album) => album.id !== id);
        });
      },

      clearAlbums: () => {
        set((state) => {
          state.albumList = [];
        });
      },

      addImage: (id, images) => {
        set((state) => {
          const index = state.albumList.findIndex((album) => album.id === id);
          if (index !== -1) {
            const album = state.albumList[index];
            album.photos.push(...images);

            if (album.coverImage === "") {
              album.coverImage = images[0].url;
            }
          }
        });
      },
      removeImage: (id, photoIndex) => {
        set((state) => {
          const index = state.albumList.findIndex((album) => album.id === id);
          if (index !== -1) {
            const album = state.albumList[index];
            album.photos.splice(photoIndex, 1);

            if (album.photos.length === 0) {
              album.coverImage = "";
            } else if (album.coverImage === album.photos[photoIndex].url) {
              album.coverImage = album.photos[0].url;
            }
          }
        });
      },
    })),
    { name: "zustand-album", storage: createJSONStorage(() => Storage) }
  )
);
