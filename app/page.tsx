'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    console.log('Authenticated user:', user);
    router.push(`/dashboard/${user.role}`);
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="text-center max-w-md w-full">
        {/* Logo */}
        <div className="mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl font-bold">F</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FoodDeliver
          </h1>
          <p className="text-gray-600 mt-2">Food delivery made simple</p>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-white text-gray-800 py-4 px-6 rounded-xl text-lg font-semibold border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
          >
            Sign In
          </button>
          
          <button
            onClick={() => router.push('/register')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            Sign Up
          </button>
        </div>

        {/* Simple Footer */}
        <div className="mt-12 text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} FoodDeliver</p>
        </div>
      </div>
    </div>
  );
}