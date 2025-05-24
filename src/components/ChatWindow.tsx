import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageList } from './MessageList';
import { FileUpload } from './FileUpload';
import { EmojiPicker } from './EmojiPicker';
import { Send, Paperclip, Smile } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface ChatWindowProps {
  chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      // Try with join first
      const { data, error } = await (supabase as any)
        .from('messages')
        .select(`
          *,
          profiles(name, avatar_url)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      console.log('Supabase messages with join:', { data, error });

      if (error) {
        // If join fails, try without join
        const fallback = await (supabase as any)
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });
        console.log('Supabase messages fallback (no join):', fallback);
        setMessages(fallback.data || []);
        return;
      }

      setMessages(data || []);
    } catch (err) {
      console.error('Error in fetchMessages:', err);
    }
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          fetchMessages(); // Refetch to get profile data
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async (content: string, type: 'text' | 'emoji' = 'text') => {
    if (!content.trim() || !user) return;

    try {
      const { error } = await (supabase as any)
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          content: content.trim(),
          message_type: type
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive"
        });
        return;
      }

      setNewMessage('');
    } catch (err) {
      console.error('Error in sendMessage:', err);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(newMessage);
  };

  const handleEmojiSelect = (emoji: string) => {
    sendMessage(emoji, 'emoji');
    setShowEmojiPicker(false);
  };

  const handleFileUpload = async (url: string, fileName: string, fileSize: number, type: 'image' | 'file') => {
    try {
      const { error } = await (supabase as any)
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user?.id,
          content: fileName,
          message_type: type,
          file_url: url,
          file_name: fileName,
          file_size: fileSize
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to send file",
          variant: "destructive"
        });
        return;
      }

      setShowFileUpload(false);
    } catch (err) {
      console.error('Error in handleFileUpload:', err);
      toast({
        title: "Error",
        description: "Failed to send file",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} currentUserId={user?.id || ''} />
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFileUpload(true)}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-4 w-4" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2">
                <EmojiPicker onEmojiSelect={handleEmojiSelect} />
              </div>
            )}
          </div>

          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {showFileUpload && (
        <FileUpload
          onUpload={handleFileUpload}
          onClose={() => setShowFileUpload(false)}
        />
      )}
    </div>
  );
}
