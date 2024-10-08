// components/chat/CreateChannelForm.tsx
'use client';

import React, { useState } from 'react';
import { createChannel } from '@/utils/chatApi';

interface CreateChannelFormProps {
  onChannelCreated: () => void;
}

const CreateChannelForm: React.FC<CreateChannelFormProps> = ({ onChannelCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Channel name is required');
      return;
    }

    try {
      await createChannel({ name, description, is_public: isPublic });
      setName('');
      setDescription('');
      setIsPublic(true);
      onChannelCreated();
    } catch (error) {
      setError('Failed to create channel. Please try again.');
      console.error('Error creating channel:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Create New Channel</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="channel-name" className="block text-sm font-medium mb-1">
            Channel Name
          </label>
          <input
            id="channel-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="channel-description" className="block text-sm font-medium mb-1">
            Description
          </label>
          <textarea
            id="channel-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="channel-public"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="channel-public" className="ml-2 text-sm">
            Make this channel public
          </label>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Channel
        </button>
      </div>
    </form>
  );
};

export default CreateChannelForm;