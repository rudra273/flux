import React from 'react';
import Link from 'next/link';
import { User, Clock } from 'lucide-react';

interface Post {
  id: number;
  title: string;
  content: string;
  username: string;       
  created_at: string;      
  updated_at: string; 
}

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  // Function to format the time difference
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInMilliseconds = now.getTime() - postDate.getTime();
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours === 1) {
      return '1 hour ago';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      // Format date for posts older than 24 hours
      return postDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  return (
    <div className="bg-background border rounded-lg p-6 hover:shadow-lg transition-all duration-300">
      {/* User info and time */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="bg-muted/30 p-2 rounded-full">
            <User size={18} className="text-muted-foreground" />
          </div>
          {/* <span className="font-medium text-foreground">{post.username}</span> */}
          
          <Link href={`/profile/${post.username}`} className="hover:underline">
            <span className="font-medium text-foreground">{post.username}</span>
          </Link>

        </div>
        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Clock size={16} />
          <span>{getTimeAgo(post.created_at)}</span>
        </div>
      </div>

      {/* Post content */}
      <div>
        <h2 className="text-xl font-semibold mb-2 text-foreground">{post.title}</h2>
        <p className="text-muted-foreground line-clamp-3">{post.content}</p>
      </div>
    </div>
  );
};

export default PostCard;