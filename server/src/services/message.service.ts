import { Message } from '../models/Message';

const PAGE_SIZE = 30;

type CreateMessageData = {
  text: string;
  senderId: string;
  senderUsername: string;
  type: 'global' | 'room' | 'private';
  roomId?: string;
  receiverId?: string;
};

async function createMessage(data: CreateMessageData) {
  return Message.create(data);
}

async function getGlobalMessages(page = 1) {
  return Message.find({ type: 'global' })
    .sort({ createdAt: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .then((messages) => messages.reverse());
}

async function getRoomMessages(roomId: string, page = 1) {
  return Message.find({ type: 'room', roomId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .then((messages) => messages.reverse());
}

async function getPrivateMessages(
  senderId: string,
  receiverId: string,
  page = 1,
) {
  return Message.find({
    type: 'private',
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .then((messages) => messages.reverse());
}

async function getAllMessages() {
  return Message.find().sort({
    createdAt: 1,
  });
}

async function toggleReaction(
  messageId: string,
  emoji: string,
  userId: string,
) {
  const message = await Message.findById(messageId);

  if (!message) {
    return null;
  }

  const reactionIndex = message.reactions.findIndex((r) => r.emoji === emoji);

  if (reactionIndex !== -1) {
    const reaction = message.reactions[reactionIndex];

    if (reaction.users.includes(userId)) {
      reaction.users = reaction.users.filter((id) => id !== userId);

      if (reaction.users.length === 0) {
        message.reactions.splice(reactionIndex, 1);
      }
    } else {
      reaction.users.push(userId);
    }
  } else {
    message.reactions.push({ emoji, users: [userId] });
  }

  return message.save();
}

export const messagesService = {
  createMessage,
  getAllMessages,
  getGlobalMessages,
  getRoomMessages,
  getPrivateMessages,
  toggleReaction,
};
