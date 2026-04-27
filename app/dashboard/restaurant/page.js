'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { TrendingUp, Package, DollarSign, Clock, ArrowRight, Plus, List } from 'lucide-react';

export default function RestaurantDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    avgPrepTime: 0
  });

  useEffect(() => {
    fetchUser();
    fetchRestaurantStats();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchRestaurantStats = async () => {
    try {
      const response = await fetch('/api/restaurant/analytics');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats({
            totalRevenue: data.data.summary?.totalRevenue || 0,
            totalOrders: data.data.summary?.totalOrders || 0,
            pendingOrders: data.data.statusCounts?.find(s => s._id === 'pending')?.count || 0,
            avgPrepTime: 25 // Mock data for now
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Mock data for demo
      setStats({
        totalRevenue: 1250.75,
        totalOrders: 42,
        pendingOrders: 3,
        avgPrepTime: 25
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} cartCount={0} showCart={false} />
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const restaurantName = user?.restaurantInfo?.name || 'Your Restaurant';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} cartCount={0} showCart={false} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👨‍🍳
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your restaurant <span className="font-semibold text-green-600">{restaurantName}</span>
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Total Revenue */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-green-100">Total Revenue</p>
                <h3 className="text-3xl font-bold mt-2">${stats.totalRevenue.toFixed(2)}</h3>
                <p className="text-green-100 text-sm mt-2 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +12% from last week
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-2xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-blue-100">Total Orders</p>
                <h3 className="text-3xl font-bold mt-2">{stats.totalOrders}</h3>
                <p className="text-blue-100 text-sm mt-2">All time orders</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-2xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-orange-100">Pending Orders</p>
                <h3 className="text-3xl font-bold mt-2">{stats.pendingOrders}</h3>
                <p className="text-orange-100 text-sm mt-2">Need attention</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Avg Prep Time */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-purple-100">Avg Prep Time</p>
                <h3 className="text-3xl font-bold mt-2">{stats.avgPrepTime} min</h3>
                <p className="text-purple-100 text-sm mt-2">Preparation time</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Manage Orders */}
            <div 
              onClick={() => router.push('/restaurant/orders')}
              className="group bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-green-300 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <List className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Manage Orders</h3>
              <p className="text-gray-600 mb-6">
                View, accept, and update order status. Track incoming orders in real-time.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-green-600 font-medium">View Orders</span>
                <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>

            {/* Manage Menu */}
            <div 
              onClick={() => router.push('/restaurant/menu')}
              className="group bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 cursor-pointer"
             >
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Manage Menu</h3>
              <p className="text-gray-600 mb-6">
                Add, edit, or remove menu items. Update prices and availability.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-blue-600 font-medium">Edit Menu</span>
                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>

            {/* Analytics */}
            <div 
              onClick={() => router.push('/restaurant/analytics')}
              className="group bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-300 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">View Analytics</h3>
              <p className="text-gray-600 mb-6">
                Track sales, popular items, and customer trends with detailed analytics.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-purple-600 font-medium">See Reports</span>
                <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Activity</h2>
            <button className="text-green-600 hover:text-green-800 font-medium">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {/* Activity items - mock data */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">New order received</p>
                  <p className="text-gray-600 text-sm">Order #ORD-789 from John Doe</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">5 min ago</p>
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium mt-1">
                  Pending
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Payment received</p>
                  <p className="text-gray-600 text-sm">Order #ORD-788 • $24.99</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">30 min ago</p>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium mt-1">
                  Completed
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Menu item added</p>
                  <p className="text-gray-600 text-sm">"Spicy Chicken Pizza" added to menu</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">2 hours ago</p>
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium mt-1">
                  Updated
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} FoodDeliver Restaurant Portal</p>
          <p className="mt-2 text-sm">Serving delicious food since 2024</p>
        </div>
      </footer>
    </div>
  );
}