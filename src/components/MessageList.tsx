import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'emoji';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  sender_id: string;
  created_at: string;
  profiles: {
    name: string;
    avatar_url?: string;
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isOwn = message.sender_id === currentUserId;
        const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

        return (
          <div
            key={message.id}
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                isOwn
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {!isOwn && (
                <p className="text-xs font-medium text-gray-600 mb-1">
                  {message.profiles?.name || 'Unknown User'}
                </p>
              )}
              
              {message.message_type === 'text' && (
                <p className="text-sm">{message.content}</p>
              )}
              
              {message.message_type === 'emoji' && (
                <p className="text-2xl">{message.content}</p>
              )}
              
              {message.message_type === 'image' && message.file_url && (
                <div>
                  <img
                    src={message.file_url}
                    alt={message.file_name}
                    className="max-w-full h-auto rounded"
                  />
                  {message.file_name && (
                    <p className="text-xs mt-1 opacity-75">{message.file_name}</p>
                  )}
                </div>
              )}
              
              {message.message_type === 'file' && message.file_url && (
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <a
                      href={message.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm underline ${
                        isOwn ? 'text-blue-100' : 'text-blue-600'
                      }`}
                    >
                      {message.file_name}
                    </a>
                    {message.file_size && (
                      <p className="text-xs opacity-75">
                        {formatFileSize(message.file_size)}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                {timeAgo}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
