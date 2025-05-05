export interface UserTier {}

export interface User {
  id: string
  email: string
  username: string
  name: string
  phone: string
  notificationTokens: string[]
  tier: UserTier
  bio: string
  iconUrl?: string
  premiumExpireTime?: Date
}

export interface Friendship {
  userId: string
  friendId: string
  inviteTimestamp: Date
  accepted: boolean
}
