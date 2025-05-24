import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { UserSearch } from './UserSearch';
import { Button } from '@/components/ui/button';
import { LogOut, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Chat {
  id: string;
  name: string;
  is_group: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  is_online: boolean;
  last_seen: string;
}

export function ChatApp() {
  const { user, signOut } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchChats();
      fetchProfiles();
      updateOnlineStatus(true);
    }

    return () => {
      if (user) {
        updateOnlineStatus(false);
      }
    };
  }, [user]);

  const fetchChats = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('chats')
        .select(`
          *,
          chat_participants!inner(user_id)
        `)
        .eq('chat_participants.user_id', user?.id);

      if (error) {
        console.error('Error fetching chats:', error);
        return;
      }

      setChats(data || []);
    } catch (err) {
      console.error('Error in fetchChats:', err);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .neq('id', user?.id);

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      setProfiles(data || []);
    } catch (err) {
      console.error('Error in fetchProfiles:', err);
    }
  };

  const updateOnlineStatus = async (isOnline: boolean) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          is_online: isOnline,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating online status:', error);
      }
    } catch (err) {
      console.error('Error in updateOnlineStatus:', err);
    }
  };

  const createDirectChat = async (otherUserId: string) => {
    try {
      // Check if chat already exists
      const { data: existingChat } = await (supabase as any)
        .from('chat_participants')
        .select(`
          chat_id,
          chats!inner(*)
        `)
        .eq('user_id', user?.id)
        .eq('chats.is_group', false);

      if (existingChat) {
        for (const participant of existingChat) {
          const { data: otherParticipant } = await (supabase as any)
            .from('chat_participants')
            .select('user_id')
            .eq('chat_id', participant.chat_id)
            .eq('user_id', otherUserId)
            .single();

          if (otherParticipant) {
            setSelectedChatId(participant.chat_id);
            setShowUserSearch(false);
            return;
          }
        }
      }

      // Create new chat
      const { data: newChat, error: chatError } = await (supabase as any)
        .from('chats')
        .insert({
          is_group: false,
          created_by: user?.id
        })
        .select()
        .single();

      if (chatError || !newChat) {
        toast({
          title: "Error",
          description: `Failed to create chat: ${chatError?.message || 'Unknown error'}`,
          variant: "destructive"
        });
        console.error('Supabase chat creation error:', chatError);
        return;
      }

      // Add participants
      const { error: participantError } = await (supabase as any)
        .from('chat_participants')
        .insert([
          { chat_id: newChat.id, user_id: user?.id },
          { chat_id: newChat.id, user_id: otherUserId }
        ]);

      if (participantError) {
        toast({
          title: "Error",
          description: `Failed to add participants: ${participantError.message}`,
          variant: "destructive"
        });
        console.error('Supabase participant error:', participantError);
        return;
      }

      await fetchChats();
      setSelectedChatId(newChat.id);
      setShowUserSearch(false);
      
      toast({
        title: "Success",
        description: "Chat created successfully",
      });
    } catch (err) {
      console.error('Error in createDirectChat:', err);
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await updateOnlineStatus(false);
    await signOut();
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Chats</h1>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => setShowUserSearch(!showUserSearch)} 
              variant="ghost" 
              size="sm"
              className="text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button onClick={handleSignOut} variant="ghost" size="sm">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* User Search */}
        {showUserSearch && (
          <div className="border-b border-gray-200 p-4">
            <UserSearch 
              profiles={profiles}
              onSelectUser={createDirectChat}
              onClose={() => setShowUserSearch(false)}
            />
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          <ChatList
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <ChatWindow chatId={selectedChatId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Plus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="mb-2">Select a chat to start messaging</p>
              <Button 
                onClick={() => setShowUserSearch(true)}
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
