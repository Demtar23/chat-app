import mongoose, { Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationExpires: Date | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  bio: string;
  avatar: string | null;
  lastSeen: Date | null;
  bannerColor: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      default: null,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
    },

    passwordResetToken: {
      type: String,
      default: null,
    },

    passwordResetExpires: {
      type: Date,
      default: null,
    },

    bio: {
      type: String,
      default: '',
      maxlength: 200,
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

    bannerColor: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>('User', userSchema);
