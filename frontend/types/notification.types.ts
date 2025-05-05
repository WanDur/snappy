import { User } from './user.types'

enum NotificationType {
  ACCOUNT = 'account',
  SOCIAL = 'social',
  PHOTO = 'photo'
}

interface Notification {
  user: User
  type: NotificationType
  message: string
  metaData: Record<string, any>
  seen: boolean
}
