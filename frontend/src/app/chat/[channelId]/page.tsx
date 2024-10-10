'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChannelDetail, getChannel, joinChannel, leaveChannel } from '@/utils/chatApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/providers/AuthProvider';
import { ApiError } from '@/utils/apiClient';

export default function ChannelPage({ params }: { params: { channelId: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [channel, setChannel] = useState<ChannelDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const channelId = parseInt(params.channelId);

  const fetchChannelDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const channelData = await getChannel(channelId);
      setChannel(channelData);
    } catch (error: unknown) {
      console.error('Error fetching channel:', error);
      if (error instanceof ApiError && error.status === 403) {
        setError('This is a private channel. You need to be a member to view details.');
      } else {
        setError('Error loading channel details');
      }
    } finally {
      setIsLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    fetchChannelDetails();
  }, [fetchChannelDetails]);

  const handleJoinChannel = async () => {
    setIsJoining(true);
    setError(null);
    try {
      await joinChannel(channelId);
      await fetchChannelDetails();
    } catch (error: unknown) {
      console.error('Error joining channel:', error);
      setError('Failed to join channel');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveChannel = async () => {
    setIsLeaving(true);
    setError(null);
    try {
      await leaveChannel(channelId);
      await fetchChannelDetails();
    } catch (error: unknown) {
      console.error('Error leaving channel:', error);
      setError('Failed to leave channel');
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
        <h1 className="text-2xl font-semibold text-gray-700 mb-4">
          {error || 'Channel not found'}
        </h1>
        <button
          onClick={() => router.push('/chat')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">{channel.name}</h1>
          <span className={`px-3 py-1 rounded-full text-sm ${
            channel.is_public ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {channel.is_public ? 'Public' : 'Private'} Channel
          </span>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">{channel.description}</p>
        </div>

        <div className="text-sm text-gray-500 mb-6">
          Created by {channel.created_by}
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
              <span className="text-sm px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                {member.role}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
