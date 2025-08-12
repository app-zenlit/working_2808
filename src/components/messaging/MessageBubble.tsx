import { Message } from '../../types';
import { parseISO, isValid, format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export const MessageBubble = ({ message, isCurrentUser }: MessageBubbleProps) => {
  const dt =
    typeof message.timestamp === 'string'
      ? parseISO(message.timestamp)
      : new Date(message.timestamp);
  const timeString = isValid(dt) ? format(dt, 'HH:mm') : '--:--';

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isCurrentUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-800 text-white rounded-bl-md'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isCurrentUser ? 'text-blue-100' : 'text-gray-400'
          }`}
        >
          {timeString}
        </p>
      </div>
    </div>
  );
};
