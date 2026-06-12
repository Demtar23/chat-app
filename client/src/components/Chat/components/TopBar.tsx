import { useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Avatar } from './Avatar';
import { getTheme } from '../../../styles/theme';
import { ThemeToggle } from '../../ThemeToggle';
import { LangToggle } from '../../LangToggle';
import { useTranslation } from 'react-i18next';
import type { ActiveChat } from '../../../types/chat';
import { Icons } from '../../icons/icons';

type Props = {
  title: string;
  onlineCount: number;
  isDark: boolean;
  onOpenMyProfile: () => void;
  myProfile?: { username: string; avatar?: string | null };
  onSearch: (query: string) => void;
  onSearchClose: () => void;
  query: string;
  onQueryChange: (value: string) => void;
  activeChat: ActiveChat;
  onOpenRoomInfo?: () => void;
  isRoomInfoOpen?: boolean;
  isMobile?: boolean;
  mobileView?: 'sidebar' | 'chat' | 'roomInfo';
  onMobileBack?: () => void;
  onOpenSidebar?: () => void;
  searchOpen: boolean;
  onSearchOpen: () => void;
};

export function TopBar({
  title,
  onlineCount,
  isDark,
  onOpenMyProfile,
  myProfile,
  onSearch,
  onSearchClose,
  query,
  onQueryChange,
  activeChat,
  onOpenRoomInfo,
  isRoomInfoOpen,
  isMobile,
  mobileView,
  onOpenSidebar,
  searchOpen,
  onSearchOpen,
}: Props) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = getTheme(isDark);
  const { t } = useTranslation();

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  function handleSearch(value: string) {
    onQueryChange(value);
    if (value.trim().length >= 2) {
      onSearch(value);
    } else if (value.trim().length === 0) {
      onSearchClose();
    }
  }

  function handleClose() {
    onQueryChange('');
    onSearchClose();
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        onSearchOpen();
      }
      if (e.key === 'Escape' && searchOpen) handleClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  return (
    <div
      className={`h-12 border-b flex items-center px-4 gap-3 flex-shrink-0 transition-colors duration-200 ${theme.bgTertiary} ${theme.border}`}
    >
      {!searchOpen && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {isMobile && mobileView !== 'sidebar' && (
            <button
              onClick={onOpenSidebar}
              className={`p-1.5 rounded-md transition-colors ${theme.textMuted} ${theme.bgHover} mr-1`}
              title={t('topBar.menu')}
            >
              <Icons.menu className="w-5 h-5" />
            </button>
          )}

          <span className={`font-medium text-[15px] ${theme.textPrimary}`}>
            {title}
          </span>

          <span
            className={`text-xs border-l pl-3 ml-1 ${theme.textMuted} ${theme.border}`}
          >
            {onlineCount} {t('topBar.online')}
          </span>
        </div>
      )}

      {searchOpen && (
        <div
          className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md ${theme.bgInput}`}
        >
          <span className={`text-sm ${theme.textMuted}`}>
            <Icons.search className={`w-4 h-4 ${theme.textMuted}`} />
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t('topBar.searchPlaceholder')}
            className={`flex-1 bg-transparent outline-none text-sm ${theme.textPrimary} placeholder:${theme.textFaint}`}
          />
          {query && (
            <button
              onClick={() => {
                onQueryChange('');
                onSearchClose();
              }}
              className={`text-xs ${theme.textMuted} hover:${theme.textPrimary}`}
              title={t('topBar.clear')}
            >
              <Icons.close
                className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
              />
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
        <button
          onClick={() => (searchOpen ? handleClose() : onSearchOpen())}
          className={`text-sm px-2 py-1.5 rounded-md transition-colors ${
            searchOpen
              ? isDark
                ? 'bg-[#5865f2]/20 text-[#5865f2]'
                : 'bg-blue-50 text-blue-500'
              : `${theme.textMuted} ${theme.bgHover}`
          }`}
          title={t('topBar.searchTitle')}
        >
          <Icons.search
            className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
          />
        </button>

        {activeChat.type === 'room' && (
          <button
            onClick={onOpenRoomInfo}
            className={`text-sm px-2 py-1.5 rounded-md transition-colors ${
              isRoomInfoOpen
                ? isDark
                  ? 'bg-[#5865f2]/20 text-[#5865f2]'
                  : 'bg-blue-50 text-blue-500'
                : `${theme.textMuted} ${theme.bgHover}`
            }`}
            title={t('topBar.infoAboutRoom')}
          >
            <Icons.users
              className={`w-4 h-4 ${theme.iconDefault} ${theme.iconHover} transition-colors`}
            />
          </button>
        )}

        <LangToggle />

        <ThemeToggle />

        <button
          onClick={onOpenMyProfile}
          className="transition-opacity hover:opacity-80"
          title={user?.username}
        >
          <Avatar
            username={user?.username ?? ''}
            avatar={myProfile?.avatar}
            size="sm"
            isDark={isDark}
          />
        </button>
      </div>
    </div>
  );
}
