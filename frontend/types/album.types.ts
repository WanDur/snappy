export interface Album {
  id: string
  title: string
  coverImage: string
  isShared: boolean
  createdAt: string
  images: string[]
  description?: string
  contributors?: number
}
