import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import Storage from "expo-sqlite/kv-store";

import { Friend } from "@/types";
import { FriendStatus } from "@/types/friend.types";

interface FriendStore {
  friends: Friend[];
  getFriends: () => Friend[];
  hasFriend: (id: string) => boolean;
  addFriend: (friend: Friend) => void;
  getFriend: (id: string) => Friend | undefined;
  getAcceptedFriends: () => Friend[];
  removeFriend: (id: string) => void;
  changeFriendType: (id: string, type: FriendStatus) => void;
  clearFriends: () => void;
  updateFriend: (id: string, friend: Friend) => void;
}

export const useFriendStore = create<FriendStore>()(
  persist(
    immer<FriendStore>((set, get) => ({
      friends: [],

      getFriends: () => {
        return get().friends;
      },

      hasFriend: (id: string) => {
        return get().friends.some((friend) => friend.id === id);
      },

      clearFriends: () => {
        set({ friends: [] });
      },

      addFriend: (friend) => {
        set((state) => {
          const existingFriend = state.friends.find((f) => f.id === friend.id);
          if (!existingFriend) {
            state.friends.push(friend);
          }
        });
      },
      getFriend: (id) => {
        return get().friends.find((friend) => friend.id === id);
      },

      getAcceptedFriends: () => {
        return get().friends.filter(
          (friend) => friend.type === FriendStatus.FRIEND
        );
      },

      removeFriend: (id) => {
        set((state) => {
          state.friends = state.friends.filter((friend) => friend.id !== id);
        });
      },
      changeFriendType: (id, type) => {
        set((state) => {
          const friend = state.friends.find((f) => f.id === id);
          if (friend) {
            friend.type = type;
          }
        });
      },
      updateFriend: (id, friend) => {
        set((state) => {
          const index = state.friends.findIndex((f) => f.id === id);
          if (index !== -1) {
            state.friends[index] = friend;
          }
        });
      },
    })),
    { name: "zustand-friend", storage: createJSONStorage(() => Storage) }
  )
);
