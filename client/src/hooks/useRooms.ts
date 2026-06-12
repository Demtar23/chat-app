import { useEffect, useState } from 'react';
import { fetchRooms, joinRoom, leaveRoom, deleteRoom } from '../api/rooms.api';
import { getSocket } from '../services/socket';
import { notify } from '../utils/toast';
import type { Room } from '../types/room';
import type { ActiveChat } from '../types/chat';
import { useTranslation } from 'react-i18next';

type SetActiveChat = (chat: ActiveChat) => void;
type SetMobileView = (view: 'sidebar' | 'chat' | 'roomInfo') => void;

export function useRooms(
  accessToken: string | null,
  userId: string,
  isMobile: boolean,
  setActiveChat: SetActiveChat,
  setMobileView: SetMobileView,
  setIsRoomInfoOpen: (v: boolean) => void,
) {
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setIsRoomsLoading(true);
      fetchRooms(accessToken)
        .then((data) => {
          if (!cancelled) setRooms(data);
        })
        .finally(() => {
          if (!cancelled) setIsRoomsLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  function isUserInRoom(roomId: string) {
    return rooms.find((r) => r._id === roomId)?.members.includes(userId);
  }

  async function handleSelectRoom(roomId: string, roomName: string) {
    if (!accessToken) return;
    if (!isUserInRoom(roomId)) {
      const updated = await joinRoom(accessToken, roomId);
      setRooms((prev) => prev.map((r) => (r._id === roomId ? updated : r)));
    }
    getSocket()?.emit('room:join', roomId);
    setActiveChat({ type: 'room', roomId, roomName });
    if (isMobile) setMobileView('chat');
  }

  async function handleLeaveRoom(roomId: string) {
    if (!accessToken) return;
    try {
      await leaveRoom(accessToken, roomId);
      setActiveChat({ type: 'global' });
      setIsRoomInfoOpen(false);
      if (isMobile) setMobileView('chat');
      notify.success(t('room.left'));
    } catch {
      notify.error(t('room.leaveError'));
    }
  }

  async function handleDeleteRoom(roomId: string) {
    if (!accessToken) return;
    try {
      await deleteRoom(accessToken, roomId);
      notify.success(t('room.deleted'));
    } catch {
      notify.error(t('room.deleteError'));
    }
  }

  return {
    rooms,
    setRooms,
    isRoomsLoading,
    isUserInRoom,
    handleSelectRoom,
    handleLeaveRoom,
    handleDeleteRoom,
  };
}
