import { Message } from '../models/Message';

type CreateMessageData = {
  text: string;
  senderId: string;
  senderUsername: string;
};

async function createMessage(data: CreateMessageData) {
  return Message.create(data);
}

async function getAllMessages() {
  return Message.find().sort({
    createdAt: 1,
  });
}

export const messagesService = {
  createMessage,
  getAllMessages,
};
