import { Album } from './album.types'

export interface Friend {
  id: string
  name: string
  username: string
  avatar: string
  albumList: Album[]
  type: 'friend' | 'pending' | 'suggested'
  lastActive?: string
  mutualFriends?: number
}
