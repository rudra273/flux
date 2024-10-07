'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getProfile, Profile } from '../../../utils/usersApi';
import ProfileHeader from '../../../components/ProfileHeader';
import PostCard from '../../../components/PostCard';

export default function UserProfile() {
  const params = useParams();
  const username = params.username as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, [username]);

  const fetchProfile = async () => {
    try {
      const profileData = await getProfile(username);
      setProfile(profileData);
    } catch (error) {
      setError('Failed to load profile');
      console.error(error);
    }
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <ProfileHeader profile={profile} />

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recent Posts</h2>
        <div className="space-y-4">
          {profile.recent_posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}