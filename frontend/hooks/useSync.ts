import { parsePublicUrl } from "@/contexts/auth";
import { AuthContextProps } from "@/types/auth.type";
import { Friend, FriendResponse } from "@/types/friend.types";
import { useChatStore, useFriendStore, useUserStore } from "@/hooks";
import {
  FetchNewMessageResponse,
  FetchChatInfoResponse,
} from "@/types/chats.type";
import { Message } from "react-native-gifted-chat";
import { getMessageUserFromFriendId } from "../utils/chatAdapter";

const getLocalTime = (timestamp: Date) => {
  return new Date(timestamp + "Z");
};

export const useSync = () => {
  const { setUser, updateAvatar } = useUserStore();
  const { addFriend, clearFriends, hasFriend, updateFriend } = useFriendStore();
  const {
    addChat,
    hasChat,
    getChat,
    addMessage,
    getLastFetchTime,
    updateLastFetchTime,
    updateLastMessageTime,
  } = useChatStore();

  const syncUserData = async (session: AuthContextProps) => {
    try {
      session.apiWithToken.get("/user/profile/myself").then((res) => {
        const userData = res.data;
        setUser({
          id: userData.id,
          email: userData.email,
          username: userData.username,
          name: userData.name,
          phone: userData.phone,
          iconUrl: userData.iconUrl,
          bio: userData.bio,
          notificationTokens: [], // TODO - to be implemented
          tier: userData.tier,
          premiumExpireTime: userData.premiumExpireTime,
        });
        const iconUrl = parsePublicUrl(userData.iconUrl);
        updateAvatar(iconUrl);
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const syncFriends = async (session: AuthContextProps) => {
    try {
      const res = await session.apiWithToken.get("/user/friends/list");
      const data = res.data;
      data.friends.forEach((user: FriendResponse) => {
        if (hasFriend(user.id)) {
          updateFriend(user.id, {
            ...user,
            avatar: user.iconUrl ? parsePublicUrl(user.iconUrl) : undefined,
            type: "friend",
            albumList: [],
            photolist: [],
          });
        } else {
          addFriend({
            ...user,
            avatar: user.iconUrl ? parsePublicUrl(user.iconUrl) : undefined,
            type: "friend",
            albumList: [],
            photolist: [],
          });
        }
      });
      data.incomingInvitations.forEach((user: FriendResponse) => {
        addFriend({
          ...user,
          avatar: user.iconUrl ? parsePublicUrl(user.iconUrl) : undefined,
          type: "pending",
          albumList: [],
          photolist: [],
        });
      });
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const syncChats = async (session: AuthContextProps) => {
    try {
      const url = getLastFetchTime()
        ? `/chat/fetch?since=${getLastFetchTime()}`
        : "/chat/fetch";
      updateLastFetchTime();
      session.apiWithToken.get(url).then((res) => {
        const data: FetchNewMessageResponse = res.data;
        console.log("data", data);
        data.chats.forEach((chat) => {
          // If this is a new chat, fetch the chat info
          console.log("chat", chat);
          session.apiWithToken
            .get(`/chat/conversation/${chat.conversationId}/info`)
            .then((res) => {
              const chatInfo: FetchChatInfoResponse = res.data;

              // Store the participants in the friend store if not already stored
              const participants: Friend[] = chatInfo.participants.map(
                (participant) => ({
                  id: participant.userId,
                  name: participant.name,
                  username: participant.username,
                  avatar: participant.iconUrl,
                  type: "friend", // TODO: change to the correct type
                  albumList: [],
                  photolist: [],
                })
              );
              participants.forEach((participant) => {
                addFriend(participant);
              });

              // Map the participants to the user type of GiftedChat
              const users = participants.map((participant) => ({
                _id: participant.id,
                name: participant.name,
                avatar: participant.avatar,
              }));

              if (!hasChat(chat.conversationId)) {
                // Add the chat to the chat store
                addChat({
                  id: chat.conversationId,
                  type: chat.conversationType,
                  participants: participants,
                  lastMessageTime: chat.lastMessageTime,
                  initialDate: getLocalTime(chat.messages[0].timestamp),
                  unreadCount: 0,
                  messages: chat.messages.map((message) => ({
                    _id: message.messageId,
                    attachments: message.attachments,
                    text: message.message,
                    createdAt: getLocalTime(message.timestamp),
                    user: users.find((user) => user._id === message.senderId)!,
                  })),
                });
              } else {
                // If the conversation is previously stored, just append the new messages

                console.log("Appending new messages to existing chat");
                const messages = chat.messages.map((message) => ({
                  _id: message.messageId,
                  attachments: message.attachments,
                  text: message.message,
                  createdAt: getLocalTime(message.timestamp),
                  user: users.find((user) => user._id === message.senderId)!,
                }));
                updateLastMessageTime(
                  chat.conversationId,
                  getLocalTime(chat.lastMessageTime)
                );
                console.log("messages", messages);
                addMessage(chat.conversationId, messages);
              }
            });
        });
      });
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  return {
    syncUserData,
    syncFriends,
    syncChats,
  };
};
