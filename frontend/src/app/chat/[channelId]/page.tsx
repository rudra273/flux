'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChannelDetail, getChannel, joinChannel, leaveChannel } from '@/utils/chatApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/providers/AuthProvider';

export default function ChannelPage({ params }: { params: { channelId: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [channel, setChannel] = useState<ChannelDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const channelId = parseInt(params.channelId);

  useEffect(() => {
    fetchChannelDetails();
  }, [channelId]);

  const fetchChannelDetails = async () => {
    try {
      const channelData = await getChannel(channelId);
      setChannel(channelData);
    } catch (error) {
      console.error('Error fetching channel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinChannel = async () => {
    setIsJoining(true);
    try {
      await joinChannel(channelId);
      await fetchChannelDetails();
    } catch (error) {
      console.error('Error joining channel:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveChannel = async () => {
    setIsLeaving(true);
    try {
      await leaveChannel(channelId);
      await fetchChannelDetails();
    } catch (error) {
      console.error('Error leaving channel:', error);
    } finally {
      setIsLeaving(false);
    }
  };

  const goToChat = () => {
    router.push(`/chat/${channelId}/room`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-semibold text-gray-700">Channel not found</h1>
        <button
          onClick={() => router.push('/chat')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Back to Channels
        </button>
      </div>
    );
  }

  const isChannelMember = channel.members.some(
    member => member.user === user?.username
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <button
          onClick={() => router.push('/chat')}
          className="text-blue-500 hover:text-blue-600 transition-colors"
        >
          ← Back to Channels
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4">{channel.name}</h1>
        
        <div className="mb-4">
          <p className="text-gray-600">{channel.description}</p>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span>{channel.is_public ? 'Public Channel' : 'Private Channel'}</span>
          <span className="mx-2">•</span>
          <span>Created by {channel.created_by}</span>
        </div>

        <div className="flex gap-4">
          {isChannelMember ? (
            <>
              <button
                onClick={goToChat}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Go to Chat
              </button>
              <button
                onClick={handleLeaveChannel}
                disabled={isLeaving}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isLeaving ? 'Leaving...' : 'Leave Channel'}
              </button>
            </>
          ) : (
            <button
              onClick={handleJoinChannel}
              disabled={isJoining}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isJoining ? 'Joining...' : 'Join Channel'}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Members ({channel.members.length})</h2>
        <ul className="space-y-2">
          {channel.members.map((member, index) => (
            <li key={index} className="flex items-center justify-between py-2 px-4 hover:bg-gray-50 rounded-lg">
              <span>{member.user}</span>
              <span className="text-sm px-2 py-1 bg-gray-100 rounded-full text-gray-600">{member.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}