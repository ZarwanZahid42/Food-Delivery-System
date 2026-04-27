'use client';

import { Star, Clock, Bike } from 'lucide-react';

export default function RestaurantCard({ restaurant, onClick }) {
  const info = restaurant.restaurantInfo || {};
  
  // Mock data for now
  const rating = 4.5;
  const deliveryTime = '30-45 min';
  const deliveryFee = '$2.99';
  const isOpen = info.isOpen !== false;

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 cursor-pointer"
    >
      {/* Restaurant Image */}
      <div className="relative h-48 bg-gradient-to-r from-blue-100 to-purple-100 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl">
            {info.cuisine === 'Italian' ? '🍕' : 
             info.cuisine === 'Chinese' ? '🥡' : 
             info.cuisine === 'Indian' ? '🍛' : 
             info.cuisine === 'Mexican' ? '🌮' : '🏪'}
          </span>
        </div>
        
        {/* Status Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${
          isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {isOpen ? 'OPEN' : 'CLOSED'}
        </div>
        
        {/* Cuisine Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
          {info.cuisine || 'Food'}
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition">
            {info.name || 'Restaurant'}
          </h3>
          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="font-semibold">{rating}</span>
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {info.description || 'Delicious food served fresh daily'}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{deliveryTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bike className="w-4 h-4" />
            <span>{deliveryFee}</span>
          </div>
        </div>

        <button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
          View Menu
        </button>
      </div>
    </div>
  );
}