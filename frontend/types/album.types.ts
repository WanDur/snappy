export type Image = {
  photoId: string;
  uri: string;
};

export interface Album {
  id: string;
  name: string;
  coverImage: string;
  isShared: boolean;
  createdAt: string;
  images: Image[];
  description?: string;
  contributors?: number;
}

export interface AlbumPreview {
  id: string;
  name: string;
  count: number;
  coverUrl: string;
}
