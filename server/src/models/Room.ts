import { model, Schema } from 'mongoose';

const roomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      minLength: 2,
      maxLength: 32,
    },

    description: {
      type: String,
      trim: true,
      maxLength: 128,
      default: '',
    },

    createdBy: {
      type: String,
      required: true,
    },

    members: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

export const Room = model('Room', roomSchema);
