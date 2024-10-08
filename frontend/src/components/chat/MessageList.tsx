// components/chat/MessageList.tsx
'use client';

import React from 'react';
import { Message } from '@/utils/chatApi';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="space-y-4 p-4">
      {messages.map((message) => (
        <div key={message.id} className="group hover:bg-gray-50 p-3 rounded-lg transition-colors">
          <div className="flex items-baseline gap-2">
            <span className="font-medium">{message.user}</span>
            <span className="text-xs text-gray-500">
              {new Date(message.created_at).toLocaleTimeString()}
            </span>
          </div>
          <p className="mt-1 text-gray-800">{message.content}</p>
        </div>
      ))}
    </div>
  );
};

export default MessageList;