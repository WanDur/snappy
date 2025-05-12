/* ------------------------------------------------------------------
   Photo domain models  –  aligned with UML + extra week counters
------------------------------------------------------------------- */
// export interface PhotoLocation {
//   latitude: number;
//   longitude: number;
//   name?: string; // optional human-readable place
// }

export interface PhotoComment {
  id: string; // UUID per comment
  userId: string; // who wrote it
  message: string;
  timestamp: Date; // ISO-8601
}

export interface Photo {
  /* --- core fields from the UML diagram ---------------------------------- */
  id: string; // primary key (UUID)
  userId: string; // uploader
  timestamp: Date; // upload time
  url: string; // local URI or remote CDN URL
  caption?: string;
  taggedUserIds: string[];

  /* --- social signals ----------------------------------------------------- */
  likes: string[]; // list of userIds that liked
  comments: PhotoComment[]; // ordered oldest-first

  /* --- extra local-only metadata ----------------------------------------- */
  location?: string;
  year: number;
  week: number;
}

export interface PhotoPreview {
  id: string;
  url: string;
  caption?: string;
  location?: string;
  timestamp: Date;
  taggedUserIds: string[];
  likes: string[];
}

export interface FetchUserPhotosResponse {
  photos: PhotoPreview[];
}
