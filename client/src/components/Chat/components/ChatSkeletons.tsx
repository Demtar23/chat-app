type Props = { isDark: boolean };

function pulseLine(isDark: boolean, className: string) {
  return `rounded-md ${isDark ? 'bg-[#3f4147]' : 'bg-gray-200'} animate-pulse ${className}`;
}

/** Скелетон стрічки повідомлень під час fetch */
export function MessageThreadSkeleton({ isDark }: Props) {
  return (
    <div
      className="flex flex-col gap-3 px-4 py-4 flex-1"
      aria-busy="true"
      aria-label="Завантаження повідомлень"
    >
      {['w-[72%]', 'w-[48%]', 'w-[88%]', 'w-[40%]', 'w-[64%]', 'w-[52%]'].map(
        (widthClass, i) => (
          <div key={i} className="flex gap-3">
            <div
              className={pulseLine(
                isDark,
                'h-9 w-9 flex-shrink-0 rounded-full',
              )}
            />
            <div className="flex-1 space-y-2 pt-1 min-w-0">
              <div className={pulseLine(isDark, 'h-3 w-24')} />
              <div className={`${pulseLine(isDark, 'h-3')} ${widthClass}`} />
            </div>
          </div>
        ),
      )}
    </div>
  );
}

/** Скелетон списку кімнат у сайдбарі */
export function RoomsListSkeleton({ isDark }: Props) {
  return (
    <div
      className="flex flex-col gap-2 px-3 py-1"
      aria-busy="true"
      aria-label="Завантаження кімнат"
    >
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={pulseLine(isDark, 'h-7 w-full')} />
      ))}
    </div>
  );
}

/** Скелетон смуги закріплених повідомлень (висота/верстка як у PinnedMessageBar) */
export function PinnedMessageBarSkeleton({ isDark }: Props) {
  const bar = isDark ? 'bg-[#3f4147]' : 'bg-gray-200';
  const border = isDark ? 'border-[#1e1f22]' : 'border-gray-200';
  const bg = isDark ? 'bg-[#2b2d31]' : 'bg-gray-50';

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 border-b flex-shrink-0 ${bg} ${border}`}
      aria-busy="true"
      aria-label="Завантаження закріплень"
    >
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-0.5 h-2 rounded-full animate-pulse ${bar} ${i === 1 ? 'opacity-90' : 'opacity-50'}`}
          />
        ))}
      </div>
      <div className="flex-1 min-w-0 space-y-1.5 py-0.5">
        <div className={`h-3 w-32 rounded-md animate-pulse ${bar}`} />
        <div
          className={`h-3 w-full max-w-56 rounded-md animate-pulse ${bar} opacity-80`}
        />
      </div>
      <div
        className={`h-7 w-8 rounded-md flex-shrink-0 animate-pulse ${bar} opacity-60`}
      />
    </div>
  );
}
