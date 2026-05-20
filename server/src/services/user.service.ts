import { User } from '../models/User';

async function getUserById(id: string) {
  return User.findById(id, { passwordHash: 0 });
}

async function getAllUsers() {
  return User.find({}, { passwordHash: 0 });
}

async function updateUser(
  id: string,
  data: { bio?: string; avatar?: string | null },
) {
  return User.findByIdAndUpdate(
    id,
    {
      ...(data.bio !== undefined && {
        bio: data.bio.trim().slice(0, 200),
      }),

      ...(data.avatar !== undefined && {
        avatar: data.avatar,
      }),
    },
    {
      returnDocument: 'after',
      select: '-passwordHash',
    },
  );
}

async function updateLastSeen(id: string) {
  return User.findByIdAndUpdate(id, {
    lastSeen: new Date(),
  });
}

export const userService = {
  getUserById,
  getAllUsers,
  updateUser,
  updateLastSeen,
};
