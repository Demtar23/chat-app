type Props = {
  status: 'sent' | 'delivered' | 'seen';
  isDark: boolean;
};

export function MessageStatus({ status, isDark }: Props) {
  if (status === 'sent') {
    return (
      <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
        ✓
      </span>
    );
  }

  if (status === 'delivered') {
    return (
      <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        ✓✓
      </span>
    );
  }

  return (
    <span className="text-[10px] text-blue-400">
      ✓✓
    </span>
  );
}