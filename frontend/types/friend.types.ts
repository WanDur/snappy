import { Album } from './album.types'

export interface Friend {
  id: string
  name: string
  avatar: string
  albumList: Album[]
  type: 'friend' | 'pending' | 'suggested'
  lastActive?: string
  mutualFriends?: number
}
