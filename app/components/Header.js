'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, User, LogOut, Menu, X, Package } from 'lucide-react';
import Link from 'next/link';

export default function Header({ user, cartCount = 0, showCart = true, onCartClick }) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Get the correct dashboard URL based on user role
  const getDashboardUrl = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'customer':
        return '/dashboard/customer';
      case 'restaurant':
        return '/dashboard/restaurant';
      case 'driver':
        return '/dashboard/driver';
      default:
        return '/';
    }
  };

  // Get the correct orders URL based on user role
  const getOrdersUrl = () => {
    if (!user) return '#';
    switch (user.role) {
      case 'customer':
        return '/customer/orders';
      case 'restaurant':
        return '/restaurant/orders';
      case 'driver':
        return '/dashboard/driver'; // Drivers see orders in their dashboard
      default:
        return '#';
    }
  };

  // Get the correct orders label based on user role
  const getOrdersLabel = () => {
    if (!user) return 'Orders';
    switch (user.role) {
      case 'customer':
        return 'My Orders';
      case 'restaurant':
        return 'Manage Orders';
      case 'driver':
        return 'Active Deliveries';
      default:
        return 'Orders';
    }
  };

  // Only show "My Orders" to customers and "Manage Orders" to restaurants
  const shouldShowOrdersLink = user && (user.role === 'customer' || user.role === 'restaurant');

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-lg' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo - Home button */}
          <Link 
            href={user ? getDashboardUrl() : '/'} 
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-bold">F</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FoodDeliver
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {user && (
              <>
                {/* Always show Home/Dashboard link */}
                <Link 
                  href={getDashboardUrl()} 
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  {user.role === 'customer' ? 'Home' : 'Dashboard'}
                </Link>
                
                {/* Show Orders link only for customers and restaurants */}
                {shouldShowOrdersLink && (
                  <Link 
                    href={getOrdersUrl()} 
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    {getOrdersLabel()}
                  </Link>
                )}
                
                {/* Show menu management link for restaurants */}
                {user.role === 'restaurant' && (
                  <Link 
                    href="/restaurant/menu" 
                    className="text-gray-700 hover:text-green-600 font-medium"
                  >
                    Manage Menu
                  </Link>
                )}
                
                {/* Show profile link for all logged in users */}
                <Link 
                  href={user.role === 'customer' ? '/customer/profile' : '#'}
                  className="text-gray-700 hover:text-blue-600 font-medium"
                >
                  Profile
                </Link>
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Cart Icon - Only show for customers */}
            {/* {showCart && user?.role === 'customer' && (
              <button 
                onClick={onCartClick}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )} */}

            {/* Delivery Icon - For drivers */}
            {user?.role === 'driver' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-lg">
                <Package className="w-4 h-4" />
                <span className="text-sm font-medium">Driver</span>
              </div>
            )}

            {/* Restaurant Badge - For restaurant owners */}
            {user?.role === 'restaurant' && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-lg">
                <span className="text-sm font-medium">Restaurant</span>
              </div>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-xl hover:shadow-md transition">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                    user.role === 'customer' ? 'bg-gradient-to-r from-blue-600 to-purple-600' :
                    user.role === 'restaurant' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
                    'bg-gradient-to-r from-orange-600 to-amber-600'
                  }`}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline font-medium">{user.name?.split(' ')[0]}</span>
                  <User className="w-4 h-4 text-gray-600" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="px-4 py-2 border-b">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'customer' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'restaurant' ? 'bg-green-100 text-green-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Dashboard link in dropdown */}
                  <button
                    onClick={() => router.push(getDashboardUrl())}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span>🏠</span>
                    {user.role === 'customer' ? 'Home' : 'Dashboard'}
                  </button>
                  
                  {/* Orders link in dropdown (for customers and restaurants) */}
                  {shouldShowOrdersLink && (
                    <button
                      onClick={() => router.push(getOrdersUrl())}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      {getOrdersLabel()}
                    </button>
                  )}
                  
                  {/* Menu management for restaurants */}
                  {user.role === 'restaurant' && (
                    <button
                      onClick={() => router.push('/restaurant/menu')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <span>📋</span>
                      Manage Menu
                    </button>
                  )}
                  
                  {/* Profile link */}
                  <button
                    onClick={() => router.push(user.role === 'customer' ? '/customer/profile' : '#')}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  
                  <div className="border-t my-2"></div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t">
            <div className="flex flex-col gap-3">
              {user ? (
                <>
                  {/* Dashboard/Home */}
                  <Link 
                    href={getDashboardUrl()} 
                    className="px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>🏠</span>
                    {user.role === 'customer' ? 'Home' : 'Dashboard'}
                  </Link>
                  
                  {/* Orders (for customers and restaurants) */}
                  {shouldShowOrdersLink && (
                    <Link 
                      href={getOrdersUrl()} 
                      className="px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Package className="w-4 h-4" />
                      {getOrdersLabel()}
                    </Link>
                  )}
                  
                  {/* Menu management for restaurants */}
                  {user.role === 'restaurant' && (
                    <Link 
                      href="/restaurant/menu" 
                      className="px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span>📋</span>
                      Manage Menu
                    </Link>
                  )}
                  
                  {/* Profile */}
                  <Link 
                    href={user.role === 'customer' ? '/customer/profile' : '#'}
                    className="px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                  
                  <div className="my-2 border-t"></div>
                  
                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 text-left rounded-lg flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="px-4 py-2 hover:bg-gray-100 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/register"
                    className="px-4 py-2 hover:bg-gray-100 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}