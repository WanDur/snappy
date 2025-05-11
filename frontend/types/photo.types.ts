/* ------------------------------------------------------------------
   Photo domain models  –  aligned with UML + extra week counters
------------------------------------------------------------------- */
export interface PhotoLocation {
  latitude: number;
  longitude: number;
  name?: string; // optional human-readable place
}

export interface PhotoComment {
  id: string; // UUID per comment
  userId: string; // who wrote it
  message: string;
  timestamp: string; // ISO-8601
}

export interface Photo {
  /* --- core fields from the UML diagram ---------------------------------- */
  photoId: string; // primary key (UUID)
  userId: string; // uploader
  timestamp: string; // upload time  (ISO-8601)
  url: string; // local URI or remote CDN URL
  caption?: string;
  taggedUserIds: string[];

  /* --- social signals ----------------------------------------------------- */
  likes: string[]; // list of userIds that liked
  comments: PhotoComment[]; // ordered oldest-first

  /* --- extra local-only metadata ----------------------------------------- */
  location?: PhotoLocation;
  orderInWeek: number; // e.g. 2  ( “2 / 3” that week )
  weekTotal: number; // e.g. 3  ( denominator )
}

export interface PhotoPreview {
  id: string;
  url: string;
  timestamp: Date;
}
