export interface PhotoLocation {
  latitude: number
  longitude: number
  /** Optional human-readable place name (city, venue, etc.) */
  name?: string
}

export interface Photo {
  /** Unique per-photo UUID */
  photoId: string

  /** Local-file URI (when first added) or remote URL after upload */
  uri: string

  /** Optional caption or comment the user typed in */
  caption?: string

  /** ISO-8601 time the user hit “Post”  (e.g. "2025-05-06T10:24:18.553Z") */
  uploadedAt: string

  /** Where the picture was taken (if the user granted location perm) */
  location?: PhotoLocation

  /** 1-based index of this photo within its ISO-week, assigned on add */
  orderInWeek: number

  /** Total photos the user has posted in that ISO-week, updated on every add / delete */
  weekTotal: number
}
