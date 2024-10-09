
'use client';

import React, { useState, useEffect } from 'react';
import ChannelList from '@/components/chat/ChannelList';
import { Search } from 'lucide-react';
import CreateChannelForm from '@/components/chat/CreateChannelForm';
import { searchChannels, Channel, getChannels } from '@/utils/chatApi';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ChatPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial channel fetch
  useEffect(() => {
    fetchInitialChannels();
  }, []);

  const fetchInitialChannels = async () => {
    try {
      const allChannels = await getChannels();
      setChannels(allChannels);
    } catch (error) {
      console.error('Error fetching channels:', error);
      setError('Failed to fetch channels');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    setError(null);

    try {
      if (query.trim()) {
        const results = await searchChannels(query);
        setChannels(results);
      } else {
        await fetchInitialChannels();
      }
    } catch (error) {
      console.error('Error searching channels:', error);
      setError('Failed to search channels');
    } finally {
      setIsSearching(false);
    }
  };

  const handleChannelCreated = async () => {
    setShowCreateForm(false);
    await fetchInitialChannels();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Chat Channels</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {showCreateForm ? 'Cancel' : '+ New Channel'}
          </button>
        </div>

        <div className="mb-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {showCreateForm && (
            <div className="mb-6">
              <CreateChannelForm onChannelCreated={handleChannelCreated} />
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {isSearching ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <ChannelList channels={channels} />
        )}
      </div>
    </div>
  );
}
