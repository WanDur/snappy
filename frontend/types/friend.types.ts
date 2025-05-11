import { Album } from "./album.types";
import { Photo, PhotoPreview } from "./photo.types";
import { User as TUser } from "react-native-gifted-chat";

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
  type: "friend" | "pending" | "suggested" | "outgoing";
  lastActive?: string;
  mutualFriends?: number;
  photoList: Photo[];
}

export interface FriendResponse {
  id: string;
  name: string;
  username: string;
  iconUrl: string;
  friendStatus: "friend" | "pending" | "suggested" | "outgoing";
}

export interface FriendDetailResponse {
  id: string;
  name: string;
  username: string;
  iconUrl: string;
  bio?: string;
  friendStatus: "friend" | "pending" | "suggested" | "outgoing";
  mutualFriends: number;
  postsCount: number;
  friendsCount: number;
  albumsCount: number;
  recentPhotos: PhotoPreview[];
}
