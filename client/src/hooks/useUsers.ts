import { useState, useEffect } from 'react';
import { fetchAllUsers, fetchMe } from '../api/users.api';
import type { UserProfile } from '../types/user';

export function useUsers(accessToken: string | null) {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    fetchAllUsers(accessToken).then(setAllUsers);
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;
    fetchMe(accessToken).then(setMyProfile);
  }, [accessToken]);

  return { allUsers, setAllUsers, myProfile, setMyProfile };
}
