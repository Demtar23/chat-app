import { useState } from 'react';

type Props = {
  onSend: (text: string) => void;
  isDark: boolean;
};

export function MessageInput({ onSend, isDark }: Props) {
  const [text, setText] = useState('');

  function handleSend() {
    if (!text.trim()) return;
    onSend(text);
    setText('');
  }

  return (
    <div className={`px-4 py-3 border-t flex items-center gap-3 flex-shrink-0 ${isDark ? 'bg-[#313338] border-[#1e1f22]' : 'bg-white border-gray-200'}`}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Написати в #global"
        className={`flex-1 rounded-lg px-4 py-2.5 text-sm outline-none ${isDark ? 'bg-[#383a40] text-[#dbdee1] placeholder-gray-500' : 'bg-gray-100 text-gray-900 placeholder-gray-400'}`}
      />
      <button
        onClick={handleSend}
        className="bg-[#5865f2] hover:bg-[#4752c4] text-white text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
      >
        Send
      </button>
    </div>
  );
}