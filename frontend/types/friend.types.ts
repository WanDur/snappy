import { Album } from './album.types'

export interface Friend {
  /**
   * Unique identifier for the friend.
   * Also used as the chat ID in the chat list
   */
  id: string
  name: string
  username: string
  avatar: string
  albumList: Album[]
  type: 'friend' | 'pending' | 'suggested'
  lastActive?: string
  mutualFriends?: number
}
