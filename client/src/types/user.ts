export type UserProfile = {
  _id: string;
  username: string;
  bio?: string;
  avatar?: string | null;
  lastSeen?: string | null;
  createdAt?: string;
  bannerColor?: string | null;
};