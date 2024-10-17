'use client';

import React, { useEffect, useState } from 'react';
import { getChannels, Channel } from '@/utils/chatApi';
import Link from 'next/link';

interface ChannelListProps {
  channels?: Channel[];
}

const ChannelList: React.FC<ChannelListProps> = ({ channels: propChannels }) => {
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    if (propChannels) {
      setChannels(propChannels);
    } else {
      fetchChannels();
    }
  }, [propChannels]);

  const fetchChannels = async () => {
    try {
      const channelList = await getChannels();
      setChannels(channelList);
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  return (
    <ul className="space-y-2">
      {channels.map((channel) => (
        <li key={channel.id}>
          <Link
            href={`/chat/${channel.id}`}
            className="block p-4 rounded-lg border hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="font-medium">{channel.name}</div>
            {channel.description && (
              <p className="text-sm text-gray-600 mt-1">{channel.description}</p>
            )}
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <span>{channel.is_public ? 'Public' : 'Private'}</span>
              <span className="mx-2">•</span>
              <span>Created by {channel.created_by}</span>
            </div>
          </Link>
        </li>
      ))}
      {channels.length === 0 && (
        <li className="text-center py-8 text-gray-500">
          {propChannels ? 'No channels found' : 'No channels available'}
        </li>
      )}
    </ul>
  );
};

export default ChannelList;