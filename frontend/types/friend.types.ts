import { Album } from "./album.types";
import { Photo } from "./photo.types";

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
  photolist: Photo[];
}

export interface FriendResponse {
  id: string;
  name: string;
  username: string;
  iconUrl: string;
  friendStatus: "friend" | "pending" | "suggested" | "outgoing";
}
