import React from 'react';
import Image from 'next/image';
import { Edit } from 'lucide-react';
import { Profile } from '../utils/usersApi';

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile?: boolean;
  onEditClick?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  profile, 
  isOwnProfile = false,
  onEditClick
}) => {
  return (
    <div className="bg-background border rounded-lg p-6 mb-6">
      <div className="flex items-start gap-6">
        <div className="relative w-32 h-32">
          <Image
            src="https://unsplash.com/photos/grayscale-photo-of-man-XHVpWcr5grQ"
            alt={profile.username}
            fill
            className="rounded-full object-cover"
            priority
          />
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">
                {profile.first_name && profile.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile.username}
              </h1>
              <p className="text-muted-foreground">@{profile.username}</p>
            </div>
            
            {isOwnProfile && onEditClick && (
              <button
                onClick={onEditClick}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Edit size={16} />
                Edit Profile
              </button>
            )}
          </div>
          
          {profile.bio && (
            <p className="mt-4 text-foreground">{profile.bio}</p>
          )}
          
          <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
            {profile.email && (
              <span>
                Email: {profile.email}
              </span>
            )}
            {profile.dob && (
              <span>
                Born: {new Date(profile.dob).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;