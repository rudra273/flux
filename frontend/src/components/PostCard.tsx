import React from 'react';

interface Post {
  id: number;
  title: string;
  content: string;
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
    </div>
  );
};

export default PostCard;