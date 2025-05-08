import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import Storage from "expo-sqlite/kv-store";
import * as Crypto from "expo-crypto";

import { ChatItem, TMessage } from "@/types";

/**
 * ### Data structure in storage:
 * - zustand-chat (key in Storage)
 *   - chats
 *      - { chatID: ChatItem }
 *      - { chatID: ChatItem }
 *         ...
 *   - allChatID
 *      - [chatID, chatID, ...]
 *
 * ### Chat render method:
 * messages in chat are stored in reverse order, most recent message is at first index. Because rendering in gifted-chat is reverted
 *
 * ### Example usage:
 *
 * ```tsx
 * import { useChatStore } from '@/hooks'
 * const { chats, getChat, addChat, deleteChat, addMessage } = useChatStore()
 *
 * // get chat data (2 ways)
 * 1. const chat = getChat('chat-id') // recommended
 * 2. const chat = chats['chat-id']
 *
 * const companyName = chat.companyName
 * // OR
 * const { companyName } = getChat('chat-id')
 *
 * // add chat
 * addChat({ companyName: 'ABC', chatTitle: 'Manager', initialDate: new Date(), unreadCount: 0 })
 *
 * // delete chat
 * deleteChat('chat-id')
 *
 * // add message
 * const data: IMessage = {...}
 * const message = [data]
 * addMessage('chat-id', message)
 * ```
 */
interface ChatStore {
  /**
   * all chats stored with format of { chatID: ChatItem }
   */
  chats: Record<string, ChatItem>;

  /**
   * an array of all chatID
   */
  allChatID: string[];

  /**
   * return true if chat with provided id exists
   */
  hasChat: (id: string) => boolean;

  /**
   * timestamp of last fetched message from server
   */
  lastFetchTime: string | null;

  /**
   * timeout for chat sync
   */
  chatSyncTimeout: NodeJS.Timeout | null;

  setChatSyncTimeout: (timeout: NodeJS.Timeout | null) => void;

  /**
   * @returns `Date` object of last fetch time
   */
  getLastFetchTime: () => string | null;

  /**
   * update the last fetch time to now
   */
  updateLastFetchTime: () => void;

  clearLastFetchTime: () => void;

  /**
   * get chat data by provided id
   * @param id chatID start with 'chat-'
   * @returns `ChatItem`
   */
  getChat: (id: string) => ChatItem;

  /**
   * add a chat to the storage with empty message, chatID is generated automatically
   * @required `companyName`
   * @required `chatTitle`
   * @required `initialDate`
   * @optional `unreadCount`, defaults to 0
   * @optional `avatar`, default to '
   */
  addChat: ({ id, initialDate, messages, unreadCount }: ChatItem) => void;

  /**
   * update chat info
   */
  // setChatInfo: (
  //   id: string,
  //   chatTitle?: string,
  //   chatSubtitle?: string,
  //   iconUrl?: string
  // ) => void;

  /**
   * set last message time
   */
  updateLastMessageTime: (id: string, time: Date) => void;

  /**
   * add unread count
   */
  addUnreadCount: (id: string, count: number) => void;

  /**
   * clear unread count
   */
  clearUnreadCount: (id: string) => void;

  /**
   * delete chat by provided id
   * @param id chatID start with 'chat-'
   */
  deleteChat: (id: string) => void;

  /**
   * add message to the chat with provided id
   * @param id chatID start with 'chat-'
   * @param message array of `IMessage`, for single message, wrap it in an array
   */
  addMessage: (id: string, message: TMessage[]) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    immer<ChatStore>((set, get) => ({
      chats: {},
      allChatID: [],
      lastFetchTime: null,
      chatSyncTimeout: null,

      hasChat(id) {
        return get().allChatID.includes(id);
      },

      setChatSyncTimeout(timeout) {
        set((state) => {
          state.chatSyncTimeout = timeout;
        });
      },

      getLastFetchTime() {
        return get().lastFetchTime;
      },

      updateLastFetchTime() {
        set((state) => {
          state.lastFetchTime = new Date().toISOString();
        });
      },

      clearLastFetchTime() {
        set((state) => {
          state.lastFetchTime = null;
        });
      },

      getChat(id) {
        return get().chats[id];
      },

      addChat({ id, type, participants, initialDate, messages, unreadCount }) {
        // const id = `${Crypto.randomUUID().substring(0, 18)}`
        set((state) => {
          state.chats[id] = {
            id: id,
            lastMessageTime: initialDate,
            type: type,
            participants: participants,
            messages,
            initialDate,
            unreadCount: unreadCount || 0,
          };

          state.allChatID.push(id);
        });
      },

      // setChatInfo(id, iconUrl?) {
      //   set((state) => {
      //     if (iconUrl) state.chats[id].iconUrl = iconUrl;
      //   });
      // },

      updateLastMessageTime(id, time) {
        set((state) => {
          state.chats[id].lastMessageTime = time;
        });
      },

      addUnreadCount(id, count = 1) {
        set((state) => {
          state.chats[id].unreadCount += count;
        });
      },

      clearUnreadCount(id) {
        set((state) => {
          state.chats[id].unreadCount = 0;
        });
      },

      deleteChat(id) {
        set((state) => {
          delete state.chats[id];
          state.allChatID = state.allChatID.filter((chatID) => chatID !== id);
        });
      },

      addMessage(id, messages) {
        set((state) => {
          state.chats[id].messages = [...messages, ...state.chats[id].messages];
        });
      },
    })),
    { name: "zustand-chat", storage: createJSONStorage(() => Storage) }
  )
);
