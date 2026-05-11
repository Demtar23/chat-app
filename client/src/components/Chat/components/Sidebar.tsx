type OnlineUser = {
  userId: string;
  userName: string;
  socketId: string;
};

const COLORS = [
  { bg: 'bg-purple-100', text: 'text-purple-800' },
  { bg: 'bg-teal-100', text: 'text-teal-800' },
  { bg: 'bg-orange-100', text: 'text-orange-800' },
  { bg: 'bg-blue-100', text: 'text-blue-800' },
  { bg: 'bg-pink-100', text: 'text-pink-800' },
];

function getColor(index: number) {
  return COLORS[index % COLORS.length];
}

type Props = {
  users: OnlineUser[];
  isDark: boolean;
};

export function Sidebar({ users, isDark }: Props) {
  return (
    <div className={`w-52 border-r flex flex-col flex-shrink-0 ${isDark ? 'bg-[#2b2d31] border-[#1e1f22]' : 'bg-gray-50 border-gray-200'}`}>
      <div className={`px-3 py-2.5 border-b ${isDark ? 'border-[#1e1f22]' : 'border-gray-200'}`}>
        <div className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md ${isDark ? 'bg-[#404249]' : 'bg-gray-200'}`}>
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>#</span>
          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>global</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <p className={`text-[10px] tracking-widest px-3 mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          ONLINE — {users.length}
        </p>
        {users.map((user, index) => {
          const color = getColor(index);
          return (
            <div key={user.userId} className="flex items-center gap-2 px-3 py-1.5">
              <div className={`relative w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0 ${color.bg} ${color.text}`}>
                {user.userName.slice(0, 2).toUpperCase()}
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-500 border-2 border-[#2b2d31]" />
              </div>
              <span className={`text-[13px] ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {user.userName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}