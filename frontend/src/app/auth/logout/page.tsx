import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { CheckCircle } from 'lucide-react';

const LogoutPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold">Logged Out</h1>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle className="text-green-500" size={48} />
            <p className="text-lg text-center">
              You have successfully logged out.
            </p>
            <a
              href="/login"
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
            >
              Return to Login
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogoutPage;