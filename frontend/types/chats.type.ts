import { IMessage, User } from "react-native-gifted-chat";
import { ImagePickerAsset } from "expo-image-picker";
import { User as TUser } from "react-native-gifted-chat";
import { Friend } from "./friend.types";

export const SYSTEM: TUser = {
  _id: "system",
  name: "System",
};

export interface Attachment {
  url: string;
  name: string;
  type: string;
  metaData?: Omit<ImagePickerAsset, "uri" | "fileName" | "mimeType">;
}

export interface TMessage extends IMessage {
  user: User;
  attachments: Attachment[];
}

export interface ChatItem {
  id: string;
  type: "direct" | "group";
  participants: TUser[];
  lastMessageTime: Date;
  messages: TMessage[];
  initialDate: Date;
  unreadCount: number;
  title?: string;
  iconUrl?: string;
}

export interface MessageResponse {
  messageId: string;
  senderId: string;
  message: string;
  timestamp: Date;
  attachments: Attachment[];
}

export interface FetchNewMessageResponse {
  chats: {
    conversationId: string;
    conversationType: "direct" | "group";
    lastMessageTime: Date;
    messages: MessageResponse[];
  }[];
}

export interface ConversationParticipantInfo {
  userId: string;
  username: string;
  name: string;
  iconUrl: string;
}

export interface FetchChatInfoResponse {
  conversationId: string;
  conversationType: "direct" | "group";
  participants: ConversationParticipantInfo[];
  initialDate: Date;
}
