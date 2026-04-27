'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { CheckCircle, XCircle, Clock, Package, ArrowLeft } from 'lucide-react';

export default function RestaurantOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, preparing, ready

  useEffect(() => {
    fetchUser();
    fetchOrders();
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

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/restaurant/orders?status=${filter !== 'all' ? filter : ''}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrders(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch('/api/restaurant/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      });

      if (response.ok) {
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} cartCount={0} showCart={false} />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/restaurant')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
            <p className="text-gray-600">Accept and update order status</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Showing {filteredOrders.length} orders</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {['all', 'pending', 'preparing', 'ready'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-lg font-medium whitespace-nowrap ${
                filter === status
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-5 h-5 text-gray-400" />
                      <span className="font-semibold">Order #{order._id.toString().substring(0, 8)}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      <p>Customer: {order.customerId?.name || 'Customer'}</p>
                      <p>Phone: {order.customerId?.phone || 'N/A'}</p>
                      <p>Address: {order.deliveryAddress}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">${order.totalAmount?.toFixed(2)}</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <p className="font-medium mb-2">Order Items:</p>
                  <div className="space-y-2">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between py-2 border-b">
                        <span>{item.name} × {item.quantity}</span>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order._id, 'accepted')}
                        className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Accept Order
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order._id, 'cancelled')}
                        className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject Order
                      </button>
                    </>
                  )}
                  
                  {order.status === 'accepted' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'preparing')}
                      className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700"
                    >
                      Start Preparing
                    </button>
                  )}
                  
                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrderStatus(order._id, 'ready')}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700"
                    >
                      Mark as Ready
                    </button>
                  )}
                  
                  {order.status === 'ready' && (
                    <div className="w-full text-center py-3 bg-green-100 text-green-800 rounded-lg">
                      <Clock className="w-5 h-5 inline mr-2" />
                      Waiting for driver pickup
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'No orders have been placed yet.' 
                : `No ${filter} orders at the moment.`}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}