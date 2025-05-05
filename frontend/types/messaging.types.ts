import { User } from './user.types'

enum ConversationType {
  Direct = 'Direct',
  Group = 'Group'
}

enum AttachmentType {
  Image = 'image',
  Video = 'video',
  Audio = 'audio'
}

interface Attachment {
  type: AttachmentType
  name: string
  url: string
}

interface Message {
  conversation: Conversation
  sender: User
  message: string
  timestamp: string
  attachment: Attachment[]
}

interface Conversation {
  type: ConversationType
  createdBy: User
  createdAt: Date
  participants: User[]
}
