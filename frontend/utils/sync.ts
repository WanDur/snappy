import { parsePublicUrl } from "@/contexts/auth";
import { AuthContextProps } from "@/types/auth.type";
import { Friend, FriendResponse } from "@/types/friend.types";
import { useFriendStore, useUserStore } from "@/hooks";

export const syncUserData = async (session: AuthContextProps) => {
  const { setUser, updateAvatar } = useUserStore();
  session.apiWithToken.get("/user/profile/myself").then((res) => {
    const userData = res.data;
    setUser({
      id: userData.id,
      email: userData.email,
      username: userData.username,
      name: userData.name,
      phone: userData.phone,
      iconUrl: userData.iconUrl,
      bio: userData.bio,
      notificationTokens: [], // TODO - to be implemented
      tier: userData.tier,
      premiumExpireTime: userData.premiumExpireTime,
    });
    const iconUrl = parsePublicUrl(userData.iconUrl);
    updateAvatar(iconUrl);
  });
};

export const syncFriends = async (session: AuthContextProps) => {
  const { addFriend, clearFriends } = useFriendStore();
  try {
    clearFriends();
    const res = await session.apiWithToken.get("/user/friends/list");
    const data = res.data;
    data.friends.forEach((user: FriendResponse) => {
      addFriend({
        ...user,
        avatar: user.iconUrl ? parsePublicUrl(user.iconUrl) : undefined,
        type: "suggested",
        albumList: [],
        photolist: [],
      });
    });
    data.incomingInvitations.forEach((user: FriendResponse) => {
      addFriend({
        ...user,
        avatar: user.iconUrl ? parsePublicUrl(user.iconUrl) : undefined,
        type: "pending",
        albumList: [],
        photolist: [],
      });
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
  }
};
