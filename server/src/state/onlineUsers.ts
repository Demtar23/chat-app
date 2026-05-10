type onlineUser = {
  userId: string;
  userName: string;
  socketId: string;
};

export const onlineUsers = new Map<string, onlineUser>();
