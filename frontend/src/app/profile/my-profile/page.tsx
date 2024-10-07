'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../providers/AuthProvider';
import { getProfile, updateProfile, Profile, ProfileUpdateData } from '../../../utils/usersApi';
import ProfileHeader from '../../../components/ProfileHeader';
import PostCard from '../../../components/PostCard';
import EditProfileModal from '../../../components/EditProfileModal';

export default function MyProfile() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else {
        fetchProfile();
      }
    }
  }, [isLoading, isAuthenticated, router]);

  const fetchProfile = async () => {
    if (!user?.username) return;
    
    try {
      const profileData = await getProfile(user.username);
      setProfile(profileData);
    } catch (error) {
      setError('Failed to load profile');
      console.error(error);
    }
  };

  const handleUpdateProfile = async (data: ProfileUpdateData) => {
    if (!user?.username) return;
    
    try {
      await updateProfile(user.username, data);
      await fetchProfile();
      setIsEditModalOpen(false);
    } catch (error) {
      setError('Failed to update profile');
      console.error(error);
    }
  };

  if (isLoading || !profile) {
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

      <ProfileHeader
        profile={profile}
        isOwnProfile={true}
        onEditClick={() => setIsEditModalOpen(true)}
      />

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recent Posts</h2>
        <div className="space-y-4">
          {profile.recent_posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateProfile}
        />
      )}
    </div>
  );
}