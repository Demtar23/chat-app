import type { Message } from '../../../types/message';

type Props = {
  results: Message[];
  query: string;
  isSearching: boolean;
  isDark: boolean;
  onResultClick: (messageId: string) => void;
  onClose: () => void;
};

function formatTime(date: string) {
  return new Date(date).toLocaleDateString('uk-UA', {
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
  return (
    <div
      className={`absolute top-0 left-0 right-0 bottom-0 z-10 flex flex-col ${
        isDark ? 'bg-[#313338]' : 'bg-white'
      }`}
    >
      {/* Header */}
      <div
        className={`px-4 py-3 border-b flex items-center justify-between ${isDark ? 'border-[#1e1f22]' : 'border-gray-200'}`}
      >
        <p
          className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          {isSearching
            ? 'Пошук...'
            : results.length > 0
              ? `Знайдено ${results.length} повідомлень`
              : query.length >= 2
                ? 'Нічого не знайдено'
                : 'Введіть мінімум 2 символи'}
        </p>
        <button
          onClick={onClose}
          className={`text-sm px-2 py-1 rounded ${isDark ? 'text-gray-400 hover:bg-[#35373c]' : 'text-gray-500 hover:bg-gray-100'}`}
        >
          ✕ Закрити
        </button>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-2">
        {isSearching && (
          <div className="flex items-center justify-center py-12">
            <div
              className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Пошук...
            </div>
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
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                isDark ? 'hover:bg-[#2b2d31]' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-medium ${isDark ? 'text-[#5865f2]' : 'text-blue-500'}`}
                >
                  {message.senderUsername}
                </span>
                <span
                  className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                >
                  {formatTime(message.createdAt)}
                </span>
              </div>
              <p
                className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {highlightText(message.text, query)}
              </p>
            </button>
          ))}

        {!isSearching && results.length === 0 && query.length >= 2 && (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <span className="text-2xl">🔍</span>
            <p
              className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              За запитом «{query}» нічого не знайдено
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
