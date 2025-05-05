interface Photo {
  ownerId: string
  timestamp: Date
  url: string
  caption?: string
  taggedUserIds: string[]
}
