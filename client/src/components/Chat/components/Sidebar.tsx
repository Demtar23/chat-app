import { useState } from 'react';
import { RoomsListSkeleton } from './ChatSkeletons';
import type { Room } from '../../../types/room';
import type { ActiveChat } from '../../../types/chat';
import type { OnlineUser } from '../../../types/socket';
import type { UserProfile } from '../../../types/user';
import { Avatar } from './Avatar';
import { getTheme } from '../../../styles/theme';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../icons/icons';

type Props = {
  isDark: boolean;
  onlineUsers: OnlineUser[];
  allUsers: UserProfile[];
  rooms: Room[];
  activeChat: ActiveChat;
  currentUserId: string;
  onSelectGlobal: () => void;
  onSelectRoom: (roomId: string, roomName: string) => void;
  onSelectPrivate: (userId: string, username: string) => void;
  onCreateRoom: () => void;
  isRoomsLoading?: boolean;
  fullWidth?: boolean;
};

export function Sidebar({
  isDark,
  onlineUsers,
  allUsers,
  rooms,
  activeChat,
  currentUserId,
  onSelectGlobal,
  onSelectRoom,
  onSelectPrivate,
  onCreateRoom,
  isRoomsLoading = false,
  fullWidth,
}: Props) {
  const [openSections, setOpenSections] = useState({
    rooms: true,
    direct: true,
    online: true,
    offline: true,
  });

  const { t } = useTranslation();
  const theme = getTheme(isDark);

  function toggleSection(section: 'rooms' | 'direct' | 'online' | 'offline') {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  const bg = theme.bgSecondary;
  const border = theme.border;
  const textMuted = theme.textMuted;
  const textPrimary = theme.textPrimary;
  const activeItem = theme.bgActive;
  const hoverItem = theme.bgHover;

  const onlineUserIds = new Set(onlineUsers.map((u) => u.userId));

  const offlineUsers = allUsers.filter(
    (u) => u._id !== currentUserId && !onlineUserIds.has(u._id),
  );

  return (
    <div
      className={`${fullWidth ? 'w-full' : 'w-52'} border-r flex flex-col flex-shrink-0 transition-colors duration-200 ${bg} ${border}`}
    >
      <div className={`p-2 border-b ${border}`}>
        <button
          onClick={onSelectGlobal}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors duration-150 ${
            activeChat.type === 'global' ? activeItem : hoverItem
          }`}
        >
          <span className={textMuted}>
            <Icons.hash
              className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
            />
          </span>
          <span className={`font-medium ${textPrimary}`}>
            {t('sidebar.global')}
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-2">
        <div>
          <div className="flex items-center justify-between px-3 mb-1">
            <button
              onClick={() => toggleSection('rooms')}
              className={`text-[10px] tracking-widest font-medium ${textMuted} flex items-center gap-1`}
            >
              <span>
                {openSections.rooms ? (
                  <Icons.chevronDown
                    className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
                  />
                ) : (
                  <Icons.chevronRight
                    className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
                  />
                )}
              </span>
              {t('sidebar.rooms')}
            </button>
            <button
              onClick={onCreateRoom}
              className={`text-lg leading-none ${textMuted} hover:text-white transition-colors`}
              title={t('sidebar.createRoom')}
            >
              <Icons.plus
                className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
              />
            </button>
          </div>

          {openSections.rooms && (
            <div className="flex flex-col">
              {isRoomsLoading ? (
                <RoomsListSkeleton isDark={isDark} />
              ) : (
                <>
                  {rooms.length === 0 && (
                    <p className={`text-xs px-3 py-1 ${textMuted}`}>
                      {t('sidebar.noRooms')}
                    </p>
                  )}
                  {rooms.map((room) => {
                    const isMember = room.members.includes(currentUserId);
                    return (
                      <button
                        key={room._id}
                        onClick={() => onSelectRoom(room._id, room.name)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-colors duration-150 ${
                          activeChat.type === 'room' &&
                          activeChat.roomId === room._id
                            ? activeItem
                            : hoverItem
                        }`}
                      >
                        <span className={textMuted}>
                          <Icons.hash
                            className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
                          />
                        </span>
                        <span className={textPrimary}>{room.name}</span>
                        {!isMember && (
                          <Icons.plus
                            className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
                          />
                        )}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="px-3 mb-1">
            <button
              onClick={() => toggleSection('direct')}
              className={`text-[10px] tracking-widest font-medium ${textMuted} flex items-center gap-1`}
            >
              <span>
                {openSections.direct ? (
                  <Icons.chevronDown
                    className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
                  />
                ) : (
                  <Icons.chevronRight
                    className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
                  />
                )}
              </span>
              {t('sidebar.direct')}
            </button>
          </div>

          {openSections.direct && (
            <div className="flex flex-col gap-1">
              <div>
                <button
                  onClick={() => toggleSection('online')}
                  className={`text-[10px] tracking-widest font-medium ${textMuted} flex items-center gap-1 px-3 mb-1`}
                >
                  <span>
                    {openSections.online ? (
                      <Icons.chevronDown
                        className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
                      />
                    ) : (
                      <Icons.chevronRight
                        className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
                      />
                    )}
                  </span>
                  {t('sidebar.online')} —{' '}
                  {onlineUsers.filter((u) => u.userId !== currentUserId).length}
                </button>

                {openSections.online &&
                  onlineUsers
                    .filter((u) => u.userId !== currentUserId)
                    .map((onlineUser) => {
                      const fullUser = allUsers.find(
                        (u) => u._id === onlineUser.userId,
                      );
                      return (
                        <button
                          key={onlineUser.userId}
                          onClick={() =>
                            onSelectPrivate(
                              onlineUser.userId,
                              onlineUser.userName,
                            )
                          }
                          className={`flex items-center gap-2 px-3 py-1.5 w-full transition-colors ${
                            activeChat.type === 'private' &&
                            activeChat.userId === onlineUser.userId
                              ? activeItem
                              : hoverItem
                          }`}
                        >
                          <div className="relative flex-shrink-0">
                            <Avatar
                              username={onlineUser.userName}
                              avatar={fullUser?.avatar}
                              size="xs"
                              isDark={isDark}
                            />
                            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-green-500 border border-[#2b2d31]" />
                          </div>
                          <span className={`text-sm truncate ${textPrimary}`}>
                            {onlineUser.userName}
                          </span>
                        </button>
                      );
                    })}
              </div>

              {offlineUsers.length > 0 && (
                <div className={`border-t ${border} pt-1`}>
                  <button
                    onClick={() => toggleSection('offline')}
                    className={`text-[10px] tracking-widest font-medium ${textMuted} flex items-center gap-1 px-3 mb-1`}
                  >
                    <span>
                      {openSections.offline ? (
                        <Icons.chevronDown
                          className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
                        />
                      ) : (
                        <Icons.chevronRight
                          className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
                        />
                      )}
                    </span>
                    {t('sidebar.offline')} — {offlineUsers.length}
                  </button>

                  {openSections.offline &&
                    offlineUsers.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => onSelectPrivate(user._id, user.username)}
                        className={`flex items-center gap-2 px-3 py-1.5 w-full transition-colors ${
                          activeChat.type === 'private' &&
                          activeChat.userId === user._id
                            ? activeItem
                            : hoverItem
                        }`}
                      >
                        <div className="relative flex-shrink-0">
                          <Avatar
                            username={user.username}
                            avatar={user.avatar}
                            size="xs"
                            isDark={isDark}
                          />
                          <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-gray-500 border border-[#2b2d31]" />
                        </div>
                        <span className={`text-sm truncate ${textMuted}`}>
                          {user.username}
                        </span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
