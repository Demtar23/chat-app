import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    bio: {
      type: String,
      default: '',
      maxLength: 200,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    lastSeen: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
