// app/chat/[channelId]/page.tsx
import React from 'react';
import ChatRoom from '@/components/chat/ChatRoom';

export default function ChannelPage() {
  return (
    <div className="h-screen">
      <ChatRoom />
    </div>
  );
}
