import { model, Schema } from 'mongoose';

const reactionSchema = new Schema(
  {
    emoji: {
      type: String,
      required: true,
    },
    users: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const messageSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },

    senderId: {
      type: String,
      required: true,
    },

    senderUsername: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ['global', 'room', 'private'],
      required: true,
      default: 'global',
    },

    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      default: null,
    },

    receiverId: {
      type: String,
      default: null,
    },

    reactions: {
      type: [reactionSchema],
      default: [],
    },
  },

  {
    timestamps: true,
  },
);

messageSchema.index({ type: 1, createdAt: -1 });
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

export const Message = model('Message', messageSchema);
