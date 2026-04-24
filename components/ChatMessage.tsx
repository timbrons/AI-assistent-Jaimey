type Props = {
  message: {
    role: 'user' | 'assistant';
    content: string;
  };
  isStreaming?: boolean;
};

export default function ChatMessage({ message, isStreaming = false }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold select-none ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-teal-600 text-white'
            : 'bg-gradient-to-br from-teal-400 to-blue-500 text-base'
        }`}
        aria-hidden="true"
      >
        {isUser ? 'J' : '🌍'}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[78%] px-4 py-2.5 text-base leading-relaxed rounded-2xl ${
          isUser
            ? 'bg-gradient-to-br from-blue-500 to-teal-600 text-white rounded-br-none shadow'
            : [
                'bg-white text-gray-800 rounded-bl-none shadow-sm',
                'border-2',
                isStreaming ? 'border-teal-300' : 'border-teal-100',
              ].join(' ')
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        {isStreaming && (
          <span
            className="inline-block w-0.5 h-[1.1em] bg-teal-400 ml-0.5 align-middle animate-pulse"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
