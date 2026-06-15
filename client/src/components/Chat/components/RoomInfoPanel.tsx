import { useState } from 'react';
import { getTheme } from '../../../styles/theme';
import type { Room } from '../../../types/room';
import type { UserProfile } from '../../../types/user';
import { Avatar } from './Avatar';
import { Icons } from '../../icons/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { updateRoom } from '../../../api/rooms.api';
import { notify } from '../../../utils/toast';

type Props = {
  room: Room;
  isDark: boolean;
  allUsers: UserProfile[];
  currentUserId: string;
  onClose: () => void;
  onLeave: (roomId: string) => void;
  onJoin: (roomId: string) => void;
  onDelete: (roomId: string) => void;
  onUserHover: (user: UserProfile, position: { x: number; y: number }) => void;
  onUserLeave: () => void;
  onOpenProfile: (user: UserProfile) => void;
  fullWidth?: boolean;
};

export function RoomInfoPanel({
  room,
  isDark,
  allUsers,
  currentUserId,
  onClose,
  onLeave,
  onJoin,
  onDelete,
  onUserHover,
  onUserLeave,
  onOpenProfile,
  fullWidth,
}: Props) {
  const theme = getTheme(isDark);

  const { accessToken } = useAuth();
  const { t, i18n } = useTranslation();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState(room.description ?? '');
  const [isSavingDesc, setIsSavingDesc] = useState(false);

  const members = allUsers.filter((u) => room.members.includes(u._id));
  const createdByUser = allUsers.find((u) => u._id === room.createdBy);
  const isMember = room.members.includes(currentUserId);
  const isOwner = room.createdBy === currentUserId;

  const createdAt = new Date(room.createdAt).toLocaleDateString(
    i18n.language === 'uk' ? 'uk-UA' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' },
  );

  async function handleSaveDescription() {
    if (!accessToken) return;
    setIsSavingDesc(true);
    try {
      await updateRoom(accessToken, room._id, descValue.trim());
      setIsEditingDesc(false);
    } catch {
      notify.error(t('roomInfo.descriptionUpdateError'));
    } finally {
      setIsSavingDesc(false);
    }
  }

  return (
    <div
      className={`flex flex-col ${fullWidth ? 'flex-1 w-full' : 'w-64'} flex-shrink-0 border-l overflow-y-auto transition-colors duration-200 ${theme.bgSecondary} ${theme.border}`}
    >
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${theme.border}`}
      >
        <span className={`text-sm font-medium ${theme.textPrimary}`}>
          {t('roomInfo.title')}
        </span>
        <button
          onClick={onClose}
          className={`text-lg ${theme.textFaint} ${theme.bgHover} rounded-md p-1 transition-colors`}
        >
          <Icons.close
            className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
          />
        </button>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <div>
          <p
            className={`text-[10px] tracking-widest font-semibold mb-1 ${theme.textMuted}`}
          >
            {t('roomInfo.room')}
          </p>
          <p
            className={`flex items-center gap-2 text-base font-semibold ${theme.textPrimary}`}
          >
            <Icons.hash
              className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
            />
            {room.name}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <p
              className={`text-[10px] tracking-widest font-semibold ${theme.textMuted}`}
            >
              {t('roomInfo.description')}
            </p>
            {isOwner && !isEditingDesc && (
              <button
                onClick={() => setIsEditingDesc(true)}
                className={`text-[10px] ${theme.textFaint} ${theme.bgHover} px-1.5 py-0.5 rounded transition-colors`}
              >
                <Icons.edit
                  className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
                />
              </button>
            )}
          </div>

          {isEditingDesc ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={descValue}
                onChange={(e) => setDescValue(e.target.value)}
                maxLength={128}
                rows={3}
                className={`text-xs px-2 py-1.5 rounded-md outline-none border border-transparent focus:border-[#5865f2] resize-none w-full ${theme.bgInput} ${theme.textPrimary}`}
                placeholder={t('roomInfo.descriptionPlaceholder')}
                autoFocus
              />
              <p className={`text-[10px] text-right ${theme.textFaintest}`}>
                {descValue.length}/128
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDescription}
                  disabled={isSavingDesc}
                  className="flex-1 text-xs py-1.5 rounded-md bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white transition-colors"
                >
                  {isSavingDesc ? t('roomInfo.saving') : t('roomInfo.save')}
                </button>
                <button
                  onClick={() => {
                    setIsEditingDesc(false);
                    setDescValue(room.description ?? '');
                  }}
                  className={`flex-1 text-xs py-1.5 rounded-md ${theme.textMuted} ${theme.bgHover} transition-colors`}
                >
                  {t('roomInfo.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <p
              className={`text-xs leading-relaxed ${room.description ? theme.textSecondary : theme.textFaintest} ${isOwner ? 'cursor-pointer' : ''}`}
              onClick={() => isOwner && setIsEditingDesc(true)}
            >
              {room.description ||
                (isOwner
                  ? t('roomInfo.addDescription')
                  : t('roomInfo.noDescription'))}
            </p>
          )}
        </div>

        <div>
          <p
            className={`text-[10px] tracking-widest font-semibold mb-1 ${theme.textMuted}`}
          >
            {t('roomInfo.created')}
          </p>
          <p className={`text-xs ${theme.textSecondary}`}>{createdAt}</p>
          {createdByUser && (
            <p className={`text-xs mt-0.5 ${theme.textFaint}`}>
              {createdByUser.username}
            </p>
          )}
        </div>

        <div>
          <p
            className={`text-[10px] tracking-widest font-semibold mb-2 ${theme.textMuted}`}
          >
            {t('roomInfo.members')} — {room.members.length}
          </p>
          <div className="flex flex-col gap-1">
            {members.map((member) => {
              const isCurrentUser = member._id === currentUserId;
              return (
                <div
                  key={member._id}
                  className={`flex items-center gap-2 px-1 py-1 rounded-md transition-colors cursor-pointer ${theme.bgHover}`}
                  onClick={() => onOpenProfile(member)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    onUserHover(member, { x: rect.left - 240, y: rect.top });
                  }}
                  onMouseLeave={onUserLeave}
                >
                  <Avatar
                    username={member.username}
                    avatar={member.avatar}
                    size="xs"
                    isDark={isDark}
                  />
                  <span
                    className={`text-sm truncate flex-1 ${isCurrentUser ? theme.textPrimary : theme.textSecondary}`}
                  >
                    {member.username}
                    {isCurrentUser && (
                      <span className={`ml-1 text-[10px] ${theme.textFaint}`}>
                        ({t('roomInfo.you')})
                      </span>
                    )}
                  </span>
                  {member._id === room.createdBy && (
                    <span className="text-[10px] text-yellow-500 flex-shrink-0">
                      <Icons.crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          {!isMember && (
            <button
              onClick={() => onJoin(room._id)}
              className="w-full text-sm py-2 rounded-md bg-[#5865f2] hover:bg-[#4752c4] text-white transition-colors"
            >
              <Icons.plus
                className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
              />
            </button>
          )}

          {isMember && !isOwner && (
            <button
              onClick={() => onLeave(room._id)}
              className="w-full text-sm py-2 rounded-md text-red-400 hover:bg-red-500/10 transition-colors"
            >
              → {t('roomInfo.leave')}
            </button>
          )}

          {isOwner && !showDeleteConfirm && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center gap-2 text-sm py-2 rounded-md text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Icons.delete className="w-5 h-5 text-red-400" />{' '}
              {t('roomInfo.deleteRoom')}
            </button>
          )}

          {isOwner && showDeleteConfirm && (
            <div
              className={`rounded-md p-3 border border-red-500/30 bg-red-500/10`}
            >
              <p className={`text-xs mb-3 ${theme.textSecondary}`}>
                {t('roomInfo.deleteConfirm')}{' '}
                <span className="font-medium text-red-400">#{room.name}</span>?
                {t('roomInfo.irreversible')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => onDelete(room._id)}
                  className="flex-1 text-xs py-1.5 rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  {t('roomInfo.delete')}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`flex-1 text-xs py-1.5 rounded-md ${theme.textMuted} ${theme.bgHover} transition-colors`}
                >
                  {t('roomInfo.cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
