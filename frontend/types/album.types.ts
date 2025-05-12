export type AlbumPhoto = {
  photoId: string;
  url: string;
};

export interface Album {
  id: string;
  name: string;
  coverImage: string;
  shared: boolean;
  createdAt: string;
  createdBy: string;
  photos: AlbumPhoto[];
  description?: string;
  participants?: string[];
}

export interface AlbumPreview {
  id: string;
  name: string;
  count: number;
  coverUrl?: string;
}

export interface AlbumListResponse {
  sharedAlbums: Album[];
  ownAlbums: Album[];
}
