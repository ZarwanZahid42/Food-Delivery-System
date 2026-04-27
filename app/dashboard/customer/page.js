'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import RestaurantCard from '@/app/components/RestaurantCard';
import CategoryFilter from '@/app/components/CategoryFilter';
import LoadingSpinner from '@/app/components/LoadingSpinner';

export default function CustomerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchUser();
    fetchRestaurants();
    // Mock cart count for now
    setCartCount(3);
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

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/customer/restaurants');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRestaurants(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique cuisine types for categories
  const categories = ['all', ...new Set(restaurants.map(r => r.restaurantInfo?.cuisine).filter(Boolean))];

  const filteredRestaurants = selectedCategory === 'all' 
    ? restaurants 
    : restaurants.filter(r => r.restaurantInfo?.cuisine === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        user={user} 
        cartCount={cartCount} 
        showCart={true}
        onCartClick={() => router.push('/customer/cart')}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Hey {user?.name?.split(' ')[0] || 'Foodie'}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            What's cooking today? Discover delicious food near you.
          </p>
        </div>

        {/* Categories Filter */}
        {/* <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Browse by Category</h2>
          <CategoryFilter 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div> */}

        {/* Restaurants Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedCategory === 'all' ? 'All Restaurants' : `${selectedCategory} Restaurants`}
            </h2>
            <span className="text-gray-600">
              {filteredRestaurants.length} restaurants available
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard 
                  key={restaurant._id}
                  restaurant={restaurant}
                  onClick={() => router.push(`/restaurant/${restaurant._id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No restaurants found</h3>
              <p className="text-gray-600 mb-6">
                {selectedCategory === 'all' 
                  ? 'No restaurants are available right now.' 
                  : `No ${selectedCategory} restaurants available. Try another category!`}
              </p>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Show All Restaurants
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl">
            <div className="text-3xl font-bold">{restaurants.length}</div>
            <div className="text-blue-100">Restaurants Available</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl">
            <div className="text-3xl font-bold">30-45 min</div>
            <div className="text-green-100">Average Delivery Time</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl">
            <div className="text-3xl font-bold">{cartCount}</div>
            <div className="text-purple-100">Items in Your Cart</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>© {new Date().getFullYear()} FoodDeliver. All rights reserved.</p>
          <p className="mt-2 text-sm">Delivering happiness to your doorstep</p>
        </div>
      </footer>
    </div>
  );
}