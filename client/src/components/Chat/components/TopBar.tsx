import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Avatar } from './Avatar';

type Props = {
  title: string;
  onlineCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenMyProfile: () => void;
  myProfile?: { username: string; avatar?: string | null };
  onSearch: (query: string) => void;
  onSearchClose: () => void;
  query: string;
  onQueryChange: (value: string) => void;
};

export function TopBar({
  title,
  onlineCount,
  isDark,
  onToggleTheme,
  onOpenMyProfile,
  myProfile,
  onSearch,
  onSearchClose,
  query,
  onQueryChange,
}: Props) {
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  // const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const border = isDark ? 'border-[#1e1f22]' : 'border-gray-200';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
    }
  }, [searchOpen]);

  function handleSearch(value: string) {
    onQueryChange(value);
    if (value.trim().length >= 2) {
      onSearch(value.trim());
    } else if (value.trim().length === 0) {
      onSearchClose();
    }
  }

  function handleClose() {
    onQueryChange('');
    setSearchOpen(false);
    onSearchClose();
  }

  // Ctrl+F або Cmd+F відкриває пошук
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape' && searchOpen) {
        handleClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  return (
    <div
      className={`h-12 border-b flex items-center px-4 gap-3 flex-shrink-0 transition-colors duration-200 ${isDark ? 'bg-[#313338]' : 'bg-white'} ${border}`}
    >
      {/* Ліва частина — заголовок */}
      {!searchOpen && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`font-medium text-[15px] ${textPrimary}`}>
            {title}
          </span>
          <span className={`text-xs border-l pl-3 ml-1 ${textMuted} ${border}`}>
            {onlineCount} online
          </span>
        </div>
      )}

      {/* Search input — розгортається */}
      {searchOpen && (
        <div
          className={`flex-1 flex items-center gap-2 px-3 py-1.5 rounded-md ${isDark ? 'bg-[#1e1f22]' : 'bg-gray-100'}`}
        >
          <span className={`text-sm ${textMuted}`}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Пошук повідомлень..."
            className={`flex-1 bg-transparent outline-none text-sm ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
          />
          {query && (
            <button
              onClick={() => {
                onQueryChange('');
                onSearchClose();
              }}
              className={`text-xs ${textMuted} hover:text-white`}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Права частина */}
      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
        {/* Кнопка пошуку */}
        <button
          onClick={() => (searchOpen ? handleClose() : setSearchOpen(true))}
          className={`text-sm px-2 py-1.5 rounded-md transition-colors ${
            searchOpen
              ? isDark
                ? 'bg-[#5865f2]/20 text-[#5865f2]'
                : 'bg-blue-50 text-blue-500'
              : isDark
                ? 'text-gray-400 hover:bg-[#35373c]'
                : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="Пошук (Ctrl+F)"
        >
          🔍
        </button>

        <button
          onClick={onToggleTheme}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border ${
            isDark
              ? 'border-gray-600 text-gray-400 hover:bg-gray-700'
              : 'border-gray-300 text-gray-500 hover:bg-gray-100'
          }`}
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>

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
