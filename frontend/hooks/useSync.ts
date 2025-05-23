import { parsePublicUrl } from "@/contexts/auth";
import { AuthContextProps } from "@/types/auth.type";
import { Friend, FriendResponse, FriendStatus } from "@/types/friend.types";
import {
  useChatStore,
  useFriendStore,
  useUserStore,
  usePhotoStore,
  useAlbumStore,
} from "@/hooks";
import {
  FetchNewMessageResponse,
  FetchChatInfoResponse,
  MessageResponse,
  ConversationParticipantInfo,
  ChatItem,
} from "@/types/chats.type";
import { Message } from "react-native-gifted-chat";
import { getMessageUserFromFriendId } from "../utils/chatAdapter";
import { PhotoPreview, FetchUserPhotosResponse } from "@/types/photo.types";
import * as FileSystem from "expo-file-system";
import { getDateString } from "@/utils/utils";
import { AlbumListResponse } from "@/types/album.types";
import { AxiosError } from "axios";

const isoWeek = (d: Date) => {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil((1 + (t.getTime() - yearStart.getTime()) / 86400000) / 7);
};

const getLocalTime = (timestamp: Date) => {
  if (timestamp.toString().endsWith("Z")) {
    return timestamp;
  }
  return new Date(timestamp + "Z");
};

export const useSync = () => {
  const { getUser, setUser, updateAvatar } = useUserStore();
  const { getFriends, addFriend, removeFriend, hasFriend, updateFriend } =
    useFriendStore();
  const {
    allChatID,
    addChat,
    hasChat,
    getChat,
    addMessage,
    getLastFetchTime,
    updateLastFetchTime,
    updateLastMessageTime,
    updateChatInfo,
    addUnreadCount,
    deleteChat,
  } = useChatStore();
  const { addPhoto, hasPhoto, updatePhotoDetails, setLastUpdate } =
    usePhotoStore();
  const { addAlbum, getAlbum, hasAlbum, editAlbum } = useAlbumStore();

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
        if (userData.iconUrl) {
          updateAvatar(parsePublicUrl(userData.iconUrl));
        }
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const syncFriends = async (session: AuthContextProps) => {
    try {
      const res = await session.apiWithToken.get("/user/friends/list");
      const data = res.data;
      for (let i = 0; i < data.friends.length; i++) {
        const user = data.friends[i];
        if (hasFriend(user.id)) {
          updateFriend(user.id, {
            ...user,
            avatar: user.iconUrl ? parsePublicUrl(user.iconUrl) : undefined,
            type: FriendStatus.FRIEND,
            albumList: [],
            photoList: [],
          });
        } else {
          addFriend({
            ...user,
            avatar: user.iconUrl ? parsePublicUrl(user.iconUrl) : undefined,
            type: FriendStatus.FRIEND,
            albumList: [],
            photoList: [],
          });
        }
      }
      for (let i = 0; i < data.incomingInvitations.length; i++) {
        const user = data.incomingInvitations[i];
        addFriend({
          ...user,
          avatar: user.iconUrl ? parsePublicUrl(user.iconUrl) : undefined,
          type: FriendStatus.PENDING,
          albumList: [],
          photoList: [],
        });
      }
      const removedFriends = getFriends().filter(
        (friend) => !data.friends.some((user: Friend) => user.id === friend.id)
      );
      removedFriends.forEach((friend) => {
        removeFriend(friend.id);
      });
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const fetchChatInfo = async (
    session: AuthContextProps,
    conversationId: string
  ) => {
    try {
      const res = await session.apiWithToken.get(
        `/chat/conversation/${conversationId}/info`
      );
      return {
        id: res.data.conversationId,
        type: res.data.conversationType,
        participants: res.data.participants.map(
          (participant: ConversationParticipantInfo) => ({
            _id: participant.userId,
            name: participant.name,
            avatar: participant.iconUrl
              ? parsePublicUrl(participant.iconUrl)
              : undefined,
          })
        ),
        lastMessageTime: getLocalTime(res.data.lastMessageTime),
        initialDate: getLocalTime(res.data.initialDate),
        unreadCount: 0,
        messages: [],
        title: res.data.name,
      } as ChatItem;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status == 401) {
        deleteChat(conversationId);
      }
      throw error;
    }
  };

  const connectChatWebSocket = async (session: AuthContextProps) => {
    if (session.isSocketOpen("/chat/ws")) {
      return;
    }
    const ws = await session.useWebSocketWithToken("/chat/ws");
    if (ws) {
      ws.onmessage = async (e) => {
        const messageData = JSON.parse(e.data) as MessageResponse & {
          conversationId: string;
          type: string;
        };
        if (messageData.type == "new_message") {
          let chat = getChat(messageData.conversationId);
          if (!chat) {
            chat = await fetchChatInfo(session, messageData.conversationId);
            addChat(chat);
          } else if (
            chat.messages.some((m) => m._id == messageData.messageId)
          ) {
            // Already have this message
            return;
          }

          // Parse the timestamp to a Date object since it is parsed as a string with JSON
          messageData.timestamp = new Date(messageData.timestamp);
          addMessage(messageData.conversationId, [
            {
              _id: messageData.messageId,
              attachments: messageData.attachments.map((attachment) => ({
                type: attachment.type,
                url: parsePublicUrl(attachment.url),
                name: attachment.name,
              })),
              createdAt: messageData.timestamp,
              text: messageData.message,
              user: chat.participants.find(
                (participant) => participant._id === messageData.senderId
              )!,
            },
          ]);
          addUnreadCount(messageData.conversationId, 1);
          updateLastMessageTime(
            messageData.conversationId,
            messageData.timestamp
          );
          updateLastFetchTime();
        } else if (messageData.type == "removed_from_conversation") {
          deleteChat(messageData.conversationId);
        }
      };
      ws.onclose = (e) => {
        if (e.code !== 1000) {
          setTimeout(() => {
            connectChatWebSocket(session);
          }, 10000);
        }
      };
    } else {
      console.log("Failed to connect to chat web socket");
    }
  };

  const fetchAllChatInfo = async (session: AuthContextProps) => {
    const res = await session.apiWithToken.get("/chat/list");
    const chatIds: string[] = res.data.conversationIds;
    chatIds.forEach(async (chatId) => {
      const chatInfo = await fetchChatInfo(session, chatId);
      if (hasChat(chatId)) {
        updateChatInfo(chatId, chatInfo);
      } else {
        addChat(chatInfo);
      }
    });
  };

  const syncChats = async (session: AuthContextProps) => {
    try {
      const url = getLastFetchTime()
        ? `/chat/fetch?since=${getLastFetchTime()}`
        : "/chat/fetch_history";
      updateLastFetchTime();
      connectChatWebSocket(session);
      // Fetch new messages with GET endpoint
      session.apiWithToken.get(url).then((res) => {
        const data: FetchNewMessageResponse = res.data;
        data.chats.forEach((chat) => {
          // If this is a new chat, fetch the chat info
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
                  avatar: participant.iconUrl
                    ? parsePublicUrl(participant.iconUrl)
                    : undefined,
                  type: FriendStatus.SUGGESTED,
                  albumList: [],
                  photoList: [],
                })
              );
              participants.forEach((participant) => {
                if (participant.id !== getUser().id) {
                  addFriend(participant);
                }
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
                  participants: users,
                  lastMessageTime: chat.lastMessageTime,
                  initialDate: getLocalTime(chatInfo.initialDate),
                  unreadCount: chat.messages.length,
                  title: chatInfo.name,
                  messages: chat.messages.map((message) => ({
                    _id: message.messageId,
                    attachments: message.attachments.map((attachment) => ({
                      type: attachment.type,
                      url: parsePublicUrl(attachment.url),
                      name: attachment.name,
                    })),
                    text: message.message,
                    createdAt: getLocalTime(message.timestamp),
                    user: users.find((user) => user._id === message.senderId)!,
                  })),
                });
              } else {
                // If the conversation is previously stored, just append the new messages
                const messages = chat.messages
                  .filter(
                    (message) =>
                      !chat.messages.some(
                        (m) => m.messageId === message.messageId
                      )
                  )
                  .map((message) => ({
                    _id: message.messageId,
                    attachments: message.attachments.map((attachment) => ({
                      type: attachment.type,
                      url: parsePublicUrl(attachment.url),
                      name: attachment.name,
                    })),
                    text: message.message,
                    createdAt: getLocalTime(message.timestamp),
                    user: users.find((user) => user._id === message.senderId)!,
                  }));
                updateLastMessageTime(
                  chat.conversationId,
                  getLocalTime(chat.lastMessageTime)
                );
                addMessage(chat.conversationId, messages);
                addUnreadCount(chat.conversationId, messages.length);
              }
            });
        });
      });
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const syncPhotos = async (session: AuthContextProps, userId: string) => {
    try {
      const now = new Date();
      const fourWeeksBefore = new Date(
        now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000
      );
      fourWeeksBefore.setHours(0, 0, 0, 0);
      const res = await session.apiWithToken.get(`/photo/fetch/${userId}`, {
        params: {
          fromYear: fourWeeksBefore.getFullYear(),
          fromWeek: isoWeek(fourWeeksBefore),
          toYear: now.getFullYear(),
          toWeek: isoWeek(now),
        },
      });
      const data: FetchUserPhotosResponse = res.data;
      data.photos.forEach((photo) => {
        if (hasPhoto(userId, photo.id)) {
          // TODO : update photo details (comments / likes)
          updatePhotoDetails(
            userId,
            photo.id,
            photo.caption,
            photo.taggedUserIds,
            photo.likes
          );
          return;
        }
        if (getLocalTime(photo.timestamp) >= fourWeeksBefore) {
          // Cache the photo to local storage if it is within the last 4 weeks
          const downloadResumable = FileSystem.createDownloadResumable(
            parsePublicUrl(photo.url),
            FileSystem.documentDirectory! +
              getDateString(photo.timestamp) +
              "-" +
              photo.id +
              ".jpg",
            {}
          );
          downloadResumable
            .downloadAsync()
            .then((result) => {
              if (result) {
                addPhoto(userId, {
                  id: photo.id,
                  uri: result.uri,
                  caption: photo.caption,
                  taggedUserIds: photo.taggedUserIds,
                  timestamp: getLocalTime(photo.timestamp),
                  location: photo.location,
                  likes: photo.likes,
                });
              } else {
                addPhoto(userId, {
                  id: photo.id,
                  uri: parsePublicUrl(photo.url),
                  caption: photo.caption,
                  taggedUserIds: photo.taggedUserIds,
                  timestamp: getLocalTime(photo.timestamp),
                  location: photo.location,
                  likes: photo.likes,
                });
              }
            })
            .catch((error) => {
              console.error("Error downloading photo:", error);
            });
        } else {
          addPhoto(userId, {
            id: photo.id,
            uri: parsePublicUrl(photo.url),
            caption: photo.caption,
            taggedUserIds: photo.taggedUserIds,
            timestamp: getLocalTime(photo.timestamp),
            location: photo.location,
            likes: photo.likes,
          });
        }
      });
      setLastUpdate(now.getTime());
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  };

  const syncFriendPhotos = async (session: AuthContextProps) => {
    getFriends()
      .filter((friend) => friend.type === FriendStatus.FRIEND)
      .forEach((friend) => {
        syncPhotos(session, friend.id);
      });
  };

  const syncAlbums = async (session: AuthContextProps) => {
    const res = await session.apiWithToken.get("/album/fetch");
    const data: AlbumListResponse = res.data;

    [...data.sharedAlbums, ...data.ownAlbums].forEach(async (album) => {
      const existingAlbum = getAlbum(album.id);
      album.coverImage = parsePublicUrl(album.coverImage);
      album.photos = await Promise.all(
        album.photos.map(async (photo) => {
          if (
            !existingAlbum ||
            !existingAlbum.photos.some((p) => p.photoId === photo.photoId)
          ) {
            // Cache the photo to local storage if it is not already cached
            const downloadResumable = FileSystem.createDownloadResumable(
              parsePublicUrl(photo.url),
              FileSystem.documentDirectory! + photo.photoId + ".jpg",
              {}
            );
            const result = await downloadResumable.downloadAsync();
            if (result) {
              return {
                photoId: photo.photoId,
                url: result.uri,
              };
            } else {
              return {
                photoId: photo.photoId,
                url: parsePublicUrl(photo.url),
              };
            }
          } else if (existingAlbum) {
            return existingAlbum.photos.find(
              (p) => p.photoId === photo.photoId
            )!;
          } else {
            return {
              photoId: photo.photoId,
              url: parsePublicUrl(photo.url),
            };
          }
        })
      );
      if (!hasAlbum(album.id)) {
        addAlbum(album);
      } else {
        editAlbum(album.id, {
          ...existingAlbum,
          coverImage: album.coverImage,
          photos: album.photos,
        });
      }
    });
  };

  const initialSync = async (session: AuthContextProps) => {
    await syncUserData(session);
    await syncFriends(session);
    await syncPhotos(session, getUser().id);
    await syncFriendPhotos(session);
    await syncAlbums(session);
    await syncChats(session);
  };

  return {
    syncUserData,
    syncFriends,
    syncChats,
    syncPhotos,
    syncAlbums,
    syncFriendPhotos,
    fetchAllChatInfo,
    fetchChatInfo,
    initialSync,
  };
};
