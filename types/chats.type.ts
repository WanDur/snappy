import { IMessage, User } from 'react-native-gifted-chat'
import { ImagePickerAsset } from 'expo-image-picker'
import { TUser } from './profile.type'

export const SYSTEM: TUser = {
  _id: 'system',
  username: 'System'
}

export interface Attachment {
  url: string
  name: string
  type: string
  metaData?: Omit<ImagePickerAsset, 'uri' | 'fileName' | 'mimeType'>
}

export interface TMessage extends IMessage {
  user: User
  attachments: Attachment[]
}

export interface ChatItem {
  id: string
  iconUrl?: string
  lastMessageTime: Date
  chatTitle: string
  chatSubtitle: string
  messages: TMessage[]
  initialDate: Date
  unreadCount: number
}

export interface MessageResponse {
  id: string
  senderId: string
  content: string
  messageTime: Date
  attachments: Attachment[]
}

export interface FetchNewMessageResponse {
  chats: {
    id: string
    employerId: string
    providerId: string
    lastMessageTime: Date
    messages: MessageResponse[]
  }[]
}
