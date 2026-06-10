import { useTranslation } from 'react-i18next';
import { getTheme } from '../../../styles/theme';
import type { Message } from '../../../types/message';
import { Icons } from '../../icons/icons';

type Props = {
  results: Message[];
  query: string;
  isSearching: boolean;
  isDark: boolean;
  onResultClick: (messageId: string) => void;
  onClose: () => void;
};

function formatTime(date: string, locale: string) {
  return new Date(date).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text: string, query: string) {
  if (!query) return text;
  const safe = escapeRegex(query);
  const parts = text.split(new RegExp(`(${safe})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-yellow-400/40 text-inherit rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function SearchResults({
  results,
  query,
  isSearching,
  isDark,
  onResultClick,
  onClose,
}: Props) {
  const { t, i18n } = useTranslation();
  const theme = getTheme(isDark);

  return (
    <div
      className={`absolute top-0 left-0 right-0 bottom-0 z-10 flex flex-col ${theme.bgTertiary}`}
    >
      <div
        className={`px-4 py-3 border-b flex items-center justify-between ${theme.border}`}
      >
        <p className={`text-sm font-medium ${theme.textPrimary}`}>
          {isSearching
            ? t('search.searching')
            : results.length > 0
              ? t('search.found', { count: results.length })
              : query.length >= 2
                ? t('search.empty')
                : t('search.minChars')}
        </p>
        <button
          onClick={onClose}
          className={`text-sm px-2 py-1 rounded ${theme.textMuted} ${theme.bgHover}`}
        >
          {t('search.close')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-2">
        {isSearching && (
          <div className="flex items-center justify-center py-12">
            <span className={`text-sm ${theme.textMuted}`}>
              {t('search.searching')}
            </span>
          </div>
        )}

        {!isSearching &&
          results.map((message) => (
            <button
              key={message._id}
              onClick={() => {
                onResultClick(message._id);
                onClose();
              }}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${theme.bgHover}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium ${theme.brandText}`}>
                  {message.senderUsername}
                </span>
                <span className={`text-[10px] ${theme.textFaint}`}>
                  {formatTime(message.createdAt, i18n.language)}
                </span>
              </div>
              <p className={`text-sm leading-relaxed ${theme.textSecondary}`}>
                {highlightText(message.text, query)}
              </p>
            </button>
          ))}

        {!isSearching && results.length === 0 && query.length >= 2 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <span className="text-2xl">
              <Icons.inbox className={`w-10 h-10 ${theme.textFaint}`} />
            </span>
            <p className={`text-sm ${theme.textMuted}`}>
              {t('search.noResultsFor', { query })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
