import { useFriendStore } from "@/hooks";
import { AuthContextProps } from "@/types/auth.type";
import { User } from "react-native-gifted-chat";

export const getMessageUserFromFriendId = async (
  friendId: string,
  session?: AuthContextProps
): Promise<User | undefined> => {
  const { getFriend, addFriend } = useFriendStore();
  const friend = getFriend(friendId);
  if (friend) {
    return {
      _id: friend.id,
      name: friend.name,
      avatar: friend.avatar,
    };
  } else if (session) {
    const res = await session.apiWithToken.get(
      `/user/profile/fetch/${friendId}`
    );
    const user = res.data;
    // Add the friend to the friend store
    addFriend({
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.iconUrl,
      type: "friend",
      albumList: [],
      photolist: [],
    });
    return {
      _id: user.id,
      name: user.name,
      avatar: user.iconUrl,
    };
  } else {
    return undefined;
  }
};
