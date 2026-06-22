import { Message } from '../models/Message';

const PAGE_SIZE = 30;

type CreateMessageData = {
  text: string;
  senderId: string;
  senderUsername: string;
  type: 'global' | 'room' | 'private';
  roomId?: string;
  receiverId?: string;
  status?: 'sent' | 'delivered' | 'seen';
  replyTo?: {
    messageId: string;
    text: string;
    senderUsername: string;
  } | null;
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

async function updateMessageStatus(
  messageId: string,
  status: 'sent' | 'delivered' | 'seen',
) {
  return Message.findByIdAndUpdate(
    messageId,
    { status },
    { returnDocument: 'after' },
  );
}

async function markMessagesAsSeen(senderId: string, receiverId: string) {
  return Message.updateMany(
    {
      type: 'private',
      senderId,
      receiverId,
      status: { $in: ['sent', 'delivered'] },
    },
    { status: 'seen' },
  );
}

async function markAsDelivered(receiverId: string) {
  return Message.updateMany(
    {
      type: 'private',
      receiverId,
      status: 'sent',
    },
    { status: 'delivered' },
  );
}

async function editMessage(messageId: string, text: string, userId: string) {
  const message = await Message.findById(messageId);

  if (!message) {
    return null;
  }

  if (message.senderId !== userId) {
    return null;
  }

  message.text = text;
  message.isEdited = true;

  return message.save();
}

async function deleteMessageForAll(messageId: string, userId: string) {
  const message = await Message.findById(messageId);

  if (!message) {
    return null;
  }

  if (message.senderId !== userId) {
    return null;
  }

  message.isDeleted = true;
  message.text = 'Message deleted';
  message.isPinned = false;
  message.pinnedAt = null;

  return message.save();
}

async function deleteMessageForMe(messageId: string, userId: string) {
  return Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { deletedFor: userId } },
    { returnDocument: 'after' },
  );
}

async function pinMessage(messageId: string) {
  return Message.findByIdAndUpdate(
    messageId,
    { isPinned: true, pinnedAt: new Date() },
    { returnDocument: 'after' },
  );
}

async function unpinMessage(messageId: string) {
  return Message.findByIdAndUpdate(
    messageId,
    { isPinned: false, pinnedAt: null },
    { returnDocument: 'after' },
  );
}

async function getPinnedMessages(
  filter: {
    type: 'global' | 'room' | 'private';
    roomId?: string;
    senderId?: string;
    receiverId?: string;
  },
  userId?: string,
) {
  const query: Record<string, unknown> = {
    isPinned: true,
    type: filter.type,
  };

  if (filter.type === 'room') {
    query.roomId = filter.roomId;
  } else if (filter.type === 'private') {
    query.$or = [
      { senderId: filter.senderId, receiverId: filter.receiverId },
      { senderId: filter.receiverId, receiverId: filter.senderId },
    ];
  }

  if (userId) {
    query.deletedFor = { $ne: userId };
  }

  return Message.find(query).sort({ createdAt: 1 });
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function searchMessages(
  filter: {
    type: 'global' | 'room' | 'private';
    query: string;
    roomId?: string;
    senderId?: string;
    receiverId?: string;
    limit?: number;
  },
  userId?: string,
) {
  const query: Record<string, unknown> = {
    type: filter.type,
    isDeleted: false,
    text: {
      $regex: escapeRegex(filter.query),
      $options: 'i',
    },
  };

  if (filter.type === 'room') {
    query.roomId = filter.roomId;
  } else if (filter.type === 'private') {
    query.$or = [
      { senderId: filter.senderId, receiverId: filter.receiverId },
      { senderId: filter.receiverId, receiverId: filter.senderId },
    ];
  }

  if (userId) {
    query.deletedFor = { $ne: userId };
  }

  return Message.find(query)
    .sort({ createdAt: -1 })
    .limit(filter.limit ?? 20);
}

async function getGlobalMessagesBefore(
  beforeId?: string,
  limit = 30,
  userId?: string,
) {
  const query: Record<string, unknown> = { type: 'global' };
  if (beforeId) {
    query._id = { $lt: beforeId };
  }

  if (userId) {
    query.deletedFor = { $ne: userId };
  }

  return Message.find(query)
    .sort({ _id: -1 })
    .limit(limit)
    .then((msgs) => msgs.reverse());
}

async function getRoomMessagesBefore(
  roomId: string,
  beforeId?: string,
  limit = 30,
  userId?: string,
) {
  const query: Record<string, unknown> = { type: 'room', roomId };
  if (beforeId) {
    query._id = { $lt: beforeId };
  }

  if (userId) {
    query.deletedFor = { $ne: userId };
  }
  return Message.find(query)
    .sort({ _id: -1 })
    .limit(limit)
    .then((msgs) => msgs.reverse());
}

async function getPrivateMessagesBefore(
  senderId: string,
  receiverId: string,
  beforeId?: string,
  limit = 30,
  userId?: string,
) {
  const query: Record<string, unknown> = {
    type: 'private',
    $or: [
      { senderId, receiverId },
      { senderId: receiverId, receiverId: senderId },
    ],
  };

  if (beforeId) {
    query._id = { $lt: beforeId };
  }

  if (userId) {
    query.deletedFor = { $ne: userId };
  }

  return Message.find(query)
    .sort({ _id: -1 })
    .limit(limit)
    .then((msgs) => msgs.reverse());
}

async function getMessagesAround(
  messageId: string,
  filter: {
    type: 'global' | 'room' | 'private';
    roomId?: string;
    senderId?: string;
    receiverId?: string;
  },
  limit = 30,
  userId?: string,
) {
  const half = Math.floor(limit / 2);
  const baseQuery: Record<string, unknown> = { type: filter.type };

  if (filter.type === 'room') {
    baseQuery.roomId = filter.roomId;
  } else if (filter.type === 'private') {
    baseQuery.$or = [
      { senderId: filter.senderId, receiverId: filter.receiverId },
      { senderId: filter.receiverId, receiverId: filter.senderId },
    ];
  }

  if (userId) {
    baseQuery.deletedFor = { $ne: userId };
  }

  const [before, target, after] = await Promise.all([
    Message.find({ ...baseQuery, _id: { $lt: messageId } })
      .sort({ _id: -1 })
      .limit(half)
      .then((msgs) => msgs.reverse()),
    Message.findById(messageId),
    Message.find({ ...baseQuery, _id: { $gt: messageId } })
      .sort({ _id: 1 })
      .limit(half),
  ]);

  return [...before, ...(target ? [target] : []), ...after];
}

async function getMessageById(messageId: string) {
  return Message.findById(messageId);
}

export const messagesService = {
  createMessage,
  getGlobalMessages,
  getRoomMessages,
  getPrivateMessages,
  toggleReaction,
  updateMessageStatus,
  markMessagesAsSeen,
  markAsDelivered,
  editMessage,
  deleteMessageForAll,
  deleteMessageForMe,
  pinMessage,
  unpinMessage,
  getPinnedMessages,
  searchMessages,
  getGlobalMessagesBefore,
  getRoomMessagesBefore,
  getPrivateMessagesBefore,
  getMessagesAround,
  getMessageById,
};
