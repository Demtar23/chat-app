import { useState } from 'react';
import type { Room } from '../../../api/rooms.api';

type OnlineUser = {
  userId: string;
  userName: string;
  socketId: string;
};

type ActiveChat =
  | { type: 'global' }
  | { type: 'room'; roomId: string; roomName: string }
  | { type: 'private'; userId: string; username: string };

type Props = {
  isDark: boolean;
  onlineUsers: OnlineUser[];
  rooms: Room[];
  activeChat: ActiveChat;
  currentUserId: string;
  onSelectGlobal: () => void;
  onSelectRoom: (roomId: string, roomName: string) => void;
  onSelectPrivate: (userId: string, username: string) => void;
  onCreateRoom: () => void;
};

export function Sidebar({
  isDark,
  onlineUsers,
  rooms,
  activeChat,
  currentUserId,
  onSelectGlobal,
  onSelectRoom,
  onSelectPrivate,
  onCreateRoom,
}: Props) {
  const [openSections, setOpenSections] = useState({
    rooms: true,
    direct: true,
  });

  function toggleSection(section: 'rooms' | 'direct') {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  }

  const bg = isDark ? 'bg-[#2b2d31]' : 'bg-gray-50';
  const border = isDark ? 'border-[#1e1f22]' : 'border-gray-200';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const activeItem = isDark ? 'bg-[#404249]' : 'bg-gray-200';
  const hoverItem = isDark ? 'hover:bg-[#35373c]' : 'hover:bg-gray-100';

  return (
    <div className={`w-52 border-r flex flex-col flex-shrink-0 ${bg} ${border}`}>

      {/* Global */}
      <div className={`p-2 border-b ${border}`}>
        <button
          onClick={onSelectGlobal}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
            activeChat.type === 'global' ? activeItem : hoverItem
          }`}
        >
          <span className={textMuted}>#</span>
          <span className={`font-medium ${textPrimary}`}>global</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-2">

        {/* Rooms секція */}
        <div>
          <div className="flex items-center justify-between px-3 mb-1">
            <button
              onClick={() => toggleSection('rooms')}
              className={`text-[10px] tracking-widest font-medium ${textMuted} flex items-center gap-1`}
            >
              <span>{openSections.rooms ? '▾' : '▸'}</span>
              ROOMS
            </button>
            <button
              onClick={onCreateRoom}
              className={`text-lg leading-none ${textMuted} hover:text-white transition-colors`}
              title="Create room"
            >
              +
            </button>
          </div>

          {openSections.rooms && (
            <div className="flex flex-col">
              {rooms.length === 0 && (
                <p className={`text-xs px-3 py-1 ${textMuted}`}>
                  Немає кімнат
                </p>
              )}
              {rooms.map((room) => (
                <button
                  key={room._id}
                  onClick={() => onSelectRoom(room._id, room.name)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                    activeChat.type === 'room' && activeChat.roomId === room._id
                      ? activeItem
                      : hoverItem
                  }`}
                >
                  <span className={textMuted}>#</span>
                  <span className={textPrimary}>{room.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Direct Messages секція */}
        <div>
          <div className="px-3 mb-1">
            <button
              onClick={() => toggleSection('direct')}
              className={`text-[10px] tracking-widest font-medium ${textMuted} flex items-center gap-1`}
            >
              <span>{openSections.direct ? '▾' : '▸'}</span>
              DIRECT MESSAGES
            </button>
          </div>

          {openSections.direct && (
            <div className="flex flex-col">
              {onlineUsers
                .filter((u) => u.userId !== currentUserId)
                .map((user, index) => {
                  const colors = [
                    { bg: 'bg-purple-100', text: 'text-purple-800' },
                    { bg: 'bg-teal-100', text: 'text-teal-800' },
                    { bg: 'bg-orange-100', text: 'text-orange-800' },
                    { bg: 'bg-blue-100', text: 'text-blue-800' },
                    { bg: 'bg-pink-100', text: 'text-pink-800' },
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <button
                      key={user.userId}
                      onClick={() =>
                        onSelectPrivate(user.userId, user.userName)
                      }
                      className={`flex items-center gap-2 px-3 py-1.5 transition-colors ${
                        activeChat.type === 'private' &&
                        activeChat.userId === user.userId
                          ? activeItem
                          : hoverItem
                      }`}
                    >
                      <div
                        className={`relative w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium flex-shrink-0 ${color.bg} ${color.text}`}
                      >
                        {user.userName.slice(0, 2).toUpperCase()}
                        <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-green-500 border border-[#2b2d31]" />
                      </div>
                      <span className={`text-sm ${textPrimary}`}>
                        {user.userName}
                      </span>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}