
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Search, X } from 'lucide-react';
import { Profile } from './ChatApp';

interface UserSearchProps {
  profiles: Profile[];
  onSelectUser: (userId: string) => void;
  onClose: () => void;
}

export function UserSearch({ profiles, onSelectUser, onClose }: UserSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Start New Chat</h3>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative mb-3">
        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
          className="pl-10"
        />
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {filteredProfiles.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            {searchTerm ? 'No users found' : 'No other users available'}
          </p>
        ) : (
          filteredProfiles.map((profile) => (
            <button
              key={profile.id}
              onClick={() => onSelectUser(profile.id)}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center space-x-3 border border-gray-100"
            >
              <div className="relative">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                  profile.is_online ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate text-sm">{profile.name}</p>
                <p className="text-xs text-gray-500 truncate">{profile.email}</p>
              </div>
              <div className="text-xs text-gray-400">
                {profile.is_online ? 'Online' : 'Offline'}
              </div>
            </button>
          ))
        )}
      </div>
    </Card>
  );
}
