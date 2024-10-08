import { apiClient } from './apiClient';

export interface Channel {
  id: number;
  name: string;
  description: string | null;
  is_public: boolean;
  created_by: string;
  created_at: string;
}

export interface Message {
  id: number;
  content: string;
  user: string;
  created_at: string;
}

export interface ChannelMember {
  user: string;
  role: string;
}

export interface ChannelDetail extends Channel {
  members: ChannelMember[];
  messages: Message[];
}

export const getChannels = async (): Promise<Channel[]> => {
  return apiClient('/chat/channels', { requiresAuth: true });
};

export const getChannel = async (channelId: number): Promise<ChannelDetail> => {
  return apiClient(`/chat/channels/${channelId}`, { requiresAuth: true });
};

export const createChannel = async (channelData: { name: string; description?: string; is_public: boolean }): Promise<Channel> => {
  return apiClient('/chat/channels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(channelData),
    requiresAuth: true
  });
};

export const sendMessage = async (channelId: number, content: string): Promise<Message> => {
  return apiClient(`/chat/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
    requiresAuth: true
  });
};


