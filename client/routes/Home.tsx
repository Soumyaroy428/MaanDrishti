import React from "react";
import { useAuth } from "@/lib/authContext";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Maan Drishti</h1>
          <p className="text-gray-600">Please log in to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {user?.name || user?.email || 'User'}!
          </h1>
          <p className="text-gray-600">
            You are now logged in to the Maan Drishti platform.
          </p>
          <div className="mt-6">
            <p className="text-sm text-gray-500">
              Email: {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
