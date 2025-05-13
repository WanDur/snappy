import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import Storage from "expo-sqlite/kv-store";

import { User, UserTier } from "@/types";

interface UserStore {
  /**
   * user data. string fields like id or name are empty if user not logged in
   */
  user: User;
  /**
   * set when user is logged in
   */
  setUser: (user: User) => void;
  getUser: () => User;
  isPremium: () => boolean;

  updateUsername: (username: string) => void;
  updateName: (name: string) => void;
  updatePhone: (phone: string) => void;
  updateAvatar: (avatar: string) => void;
  updateTier: (tier: UserTier) => void;
  updateBio: (bio: string) => void;
  updatePremiumExpireTime: (premiumExpireTime: Date) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    immer<UserStore>((set, get) => ({
      user: {
        id: "",
        email: "",
        username: "",
        name: "",
        phone: "",
        avatar: "",
        bio: "",
        notificationTokens: [],
        tier: UserTier.FREEMIUM,
        premiumExpireTime: undefined,
      },

      setUser(user) {
        set((state) => {
          state.user = user;
        });
      },

      getUser() {
        return get().user;
      },

      isPremium() {
        if (get().user.tier === UserTier.PREMIUM) {
          if (get().user.premiumExpireTime! < new Date()) {
            set((state) => {
              state.user.tier = UserTier.FREEMIUM;
            });
            return false;
          }
          return true;
        } else if (get().user.tier === UserTier.ADMIN) {
          return true;
        }
        return false;
      },

      updateUsername(username) {
        set((state) => {
          state.user.username = username;
        });
      },

      updateName(name) {
        set((state) => {
          state.user.name = name;
        });
      },

      updatePhone(phone) {
        set((state) => {
          state.user.phone = phone;
        });
      },

      updateAvatar(avatar) {
        set((state) => {
          state.user.iconUrl = avatar;
        });
      },

      updateTier(tier) {
        set((state) => {
          state.user.tier = tier;
        });
      },

      updateBio(bio) {
        set((state) => {
          state.user.bio = bio;
        });
      },

      updatePremiumExpireTime(premiumExpireTime) {
        set((state) => {
          state.user.premiumExpireTime = premiumExpireTime;
        });
      },
    })),
    { name: "zustand-user", storage: createJSONStorage(() => Storage) }
  )
);
