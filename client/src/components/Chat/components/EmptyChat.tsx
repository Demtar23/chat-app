import EmptyChatSvg from '../../../assets/empty-chat.svg';

type EmptyChatProps = {
  title: string;
  description: string;
};

export function EmptyChat({
  title,
  description,
}: EmptyChatProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <img
        src={EmptyChatSvg}
        alt=""
        className="mb-6 w-48 select-none opacity-90"
        draggable={false}
      />

      <h2 className="mb-2 text-lg font-semibold">
        {title}
      </h2>

      <p className="max-w-sm text-sm text-gray-400">
        {description}
      </p>
    </div>
  );
}