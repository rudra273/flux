// components/chat/ChatRoom.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getChannel, ChannelDetail, Message } from '@/utils/chatApi';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Link from 'next/link';

const RECONNECT_INTERVAL = 5000; // 5 seconds

const ChatRoom: React.FC = () => {
  const params = useParams();
  const channelId = params.channelId as string;

  const [channel, setChannel] = useState<ChannelDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChannel = useCallback(async () => {
    if (channelId) {
      try {
        setError(null);
        const channelData = await getChannel(Number(channelId));
        setChannel(channelData);
        setMessages(channelData.messages);
      } catch (error) {
        console.error('Failed to fetch channel:', error);
        setError('Failed to load channel. Please try again later.');
      }
    }
  }, [channelId]);

  const connectWebSocket = useCallback(() => {
    if (channelId && channel && !isConnecting) {
      setIsConnecting(true);
      
      const token = localStorage.getItem('accessToken');

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
      const ws = new WebSocket(`${wsUrl}/chat/ws/${channelId}?token=${token}`);

      ws.onopen = () => {
        console.log('WebSocket connection established');
        setSocket(ws);
        setIsConnecting(false);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const newMessage = JSON.parse(event.data);
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        } catch (error) {
          console.error('Failed to parse message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed');
        setSocket(null);
        setIsConnecting(false);
        if (!event.wasClean) {
          setError('Connection lost. Attempting to reconnect...');
          setTimeout(connectWebSocket, RECONNECT_INTERVAL);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error. Please check your internet connection.');
        ws.close();
      };

      return () => {
        ws.close();
      };
    }
  }, [channelId, channel, isConnecting]);

  useEffect(() => {
    fetchChannel();
  }, [fetchChannel]);

  useEffect(() => {
    const cleanup = connectWebSocket();
    return () => {
      if (cleanup) cleanup();
      if (socket) {
        socket.close();
      }
    };
  }, [connectWebSocket, socket]);

  const sendMessage = useCallback((content: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(JSON.stringify({ content }));
      } catch (error) {
        console.error('Failed to send message:', error);
        setError('Failed to send message. Please try again.');
      }
    } else {
      setError('Unable to send message. Please wait for reconnection.');
    }
  }, [socket]);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="p-6 max-w-sm mx-auto bg-red-50 rounded-lg">
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={fetchChannel}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <span className="mt-4 block text-gray-600">Loading channel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <Link 
                href="/chat" 
                className="text-sm text-gray-500 hover:text-gray-700 mr-4"
              >
                ← Back to Channels
              </Link>
              <h2 className="text-xl font-semibold inline-block">{channel.name}</h2>
            </div>
            <div className="text-sm text-gray-500">
              {channel.members.length} members • {channel.is_public ? 'Public' : 'Private'} channel
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex-1 overflow-y-auto">
          <MessageList messages={messages} />
        </div>

        <div className="bg-white border-t p-4">
          <MessageInput onSendMessage={sendMessage} />
          {!socket && (
            <div className="mt-2 flex items-center justify-center text-sm text-yellow-600">
              <svg 
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-yellow-600" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Reconnecting to chat...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;