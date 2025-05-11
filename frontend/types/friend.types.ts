import { Album, AlbumPreview } from "./album.types";
import { Photo, PhotoPreview } from "./photo.types";
import { User as TUser } from "react-native-gifted-chat";

export enum FriendStatus {
  FRIEND = "friend",
  PENDING = "pending",
  SUGGESTED = "suggested",
  OUTGOING = "outgoing",
}

export interface Friend {
  /**
   * Unique identifier for the friend.
   * Also used as the chat ID in the chat list
   */
  id: string;
  name: string;
  username: string;
  avatar?: string;
  albumList: Album[];
  type: FriendStatus;
  lastActive?: string;
  mutualFriends?: number;
  photoList: Photo[];
}

export interface FriendResponse {
  id: string;
  name: string;
  username: string;
  iconUrl: string;
  friendStatus: FriendStatus;
}

export interface FriendDetailResponse {
  id: string;
  name: string;
  username: string;
  iconUrl?: string;
  bio?: string;
  friendStatus: FriendStatus;
  mutualFriends: number;
  postsCount: number;
  friendsCount: number;
  albumsCount: number;
  sharedAlbums: AlbumPreview[];
  recentPhotos: PhotoPreview[];
}
