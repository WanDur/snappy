export type Image = {
  photoId: string
  uri: string
}

export interface Album {
  id: string
  title: string
  coverImage: string
  isShared: boolean
  createdAt: string
  images: Image[]
  description?: string
  contributors?: number
}
