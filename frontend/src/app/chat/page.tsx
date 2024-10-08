// app/chat/page.tsx
import React from 'react';
import ChannelList from '@/components/chat/ChannelList';

export default function ChatPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Chat Channels</h1>
      <ChannelList />
    </div>
  );
}

