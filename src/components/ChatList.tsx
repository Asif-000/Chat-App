import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Chat, Profile } from './ChatApp';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  const { user } = useAuth();
  const [chatProfiles, setChatProfiles] = useState<Record<string, Profile>>({});

  useEffect(() => {
    fetchChatProfiles();
  }, [chats]);

  const fetchChatProfiles = async () => {
    const profileMap: Record<string, Profile> = {};

    for (const chat of chats) {
      if (!chat.is_group) {
        try {
          // Fetch participants for this chat
          const { data: participants, error } = await (supabase as any)
            .from('chat_participants')
            .select('user_id')
            .eq('chat_id', chat.id)
            .neq('user_id', user?.id);

          if (error) {
            console.error('Error fetching chat participants:', error);
          }
          if (participants && participants[0]?.user_id) {
            // Fetch the profile for this user_id
            const { data: profile } = await (supabase as any)
              .from('profiles')
              .select('id, name, is_online, avatar_url')
              .eq('id', participants[0].user_id)
              .single();
            if (profile) {
              profileMap[chat.id] = profile as Profile;
            }
          }
        } catch (err) {
          console.error('Error fetching chat profiles:', err);
        }
      }
    }
    setChatProfiles(profileMap);
    console.log('Chat profiles map:', profileMap);
  };

  return (
    <div className="space-y-1 p-2">
      {chats.map((chat) => {
        const profile = chatProfiles[chat.id];
        const displayName = chat.is_group ? chat.name : profile?.name || 'Unknown User';
        const isOnline = profile?.is_online || false;

        return (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`w-full text-left p-3 rounded-lg transition-colors ${
              selectedChatId === chat.id 
                ? 'bg-blue-100 border-blue-300' 
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                {!chat.is_group && (
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    isOnline ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{displayName}</p>
                <p className="text-sm text-gray-500">
                  {!chat.is_group && isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
