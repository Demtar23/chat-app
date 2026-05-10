import { model, Schema } from 'mongoose';

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
  },

  {
    timestamps: true,
  },
);

export const Message = model('Message', messageSchema);
