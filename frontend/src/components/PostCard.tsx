import React from 'react';

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
  console.log('Rendering PostCard:', post);

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
      <p className="text-gray-600 truncate">{post.content}</p>

      {/* New section for additional information */}
      <div className="mt-4 text-sm text-gray-500">
        <p>Posted by: <span className="font-medium">{post.username}</span></p>
        <p>Posted on: {new Date(post.created_at).toLocaleDateString()}</p>
        <p>Last updated: {new Date(post.updated_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default PostCard;
