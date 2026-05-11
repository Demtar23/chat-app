type Props = {
  onlineCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
};

export function TopBar({ onlineCount, isDark, onToggleTheme }: Props) {
  return (
    <div className={`h-12 border-b flex items-center px-4 justify-between flex-shrink-0 ${isDark ? 'bg-[#313338] border-[#1e1f22]' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-2">
        <span className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>#</span>
        <span className={`font-medium text-[15px] ${isDark ? 'text-white' : 'text-gray-900'}`}>global</span>
        <span className={`text-xs border-l pl-3 ml-1 ${isDark ? 'text-gray-400 border-gray-600' : 'text-gray-400 border-gray-300'}`}>
          Загальний чат · {onlineCount} online
        </span>
      </div>
      <button
        onClick={onToggleTheme}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border ${isDark ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-500 hover:bg-gray-100'}`}
      >
        {isDark ? '☀️ Light' : '🌙 Dark'}
      </button>
    </div>
  );
}