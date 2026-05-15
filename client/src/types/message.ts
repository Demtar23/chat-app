export type Reaction = {
  emoji: string;
  users: string[];
};

export type MessageType = 'global' | 'room' | 'private';
export type MessageStatus = 'sent' | 'delivered' | 'seen';

export type Message = {
  _id: string;
  text: string;
  senderId: string;
  senderUsername: string;
  type: MessageType;
  roomId?: string;
  receiverId?: string;
  createdAt: string;
  reactions: Reaction[];
  status: MessageStatus;
  isEdited: boolean;
  isDeleted: boolean;
  deletedFor: string[];
};