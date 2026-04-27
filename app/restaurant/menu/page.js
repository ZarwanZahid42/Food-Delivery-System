'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Plus, Edit, Trash2, Save, X, Filter } from 'lucide-react';

export default function MenuManagementPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  
  // New item form state
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    isAvailable: true
  });

  useEffect(() => {
    fetchUser();
    fetchMenuItems();
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

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/restaurant/menu');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMenuItems(data.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addMenuItem = async () => {
    if (!newItem.name || !newItem.price) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/restaurant/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Add new item to list
        setMenuItems(prev => [data.data, ...prev]);
        
        // Reset form
        setNewItem({
          name: '',
          description: '',
          price: '',
          category: 'Main Course',
          isAvailable: true
        });
        setShowAddForm(false);
        
        alert('✅ Menu item added successfully!');
      } else {
        alert('Failed to add item: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Add item error:', error);
      alert('Failed to add menu item');
    }
  };

  const updateMenuItem = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch('/api/restaurant/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem._id,
          ...editingItem
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update item in list
        setMenuItems(prev => 
          prev.map(item => 
            item._id === editingItem._id ? data.data : item
          )
        );
        setEditingItem(null);
        alert('✅ Menu item updated successfully!');
      } else {
        alert('Failed to update item: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Update item error:', error);
      alert('Failed to update menu item');
    }
  };

  const deleteMenuItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      const response = await fetch('/api/restaurant/menu', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemId })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Remove item from list
        setMenuItems(prev => prev.filter(item => item._id !== itemId));
        alert('✅ Menu item deleted successfully!');
      } else {
        alert('Failed to delete item: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Delete item error:', error);
      alert('Failed to delete menu item');
    }
  };

  const toggleAvailability = async (itemId, currentStatus) => {
    try {
      const itemToUpdate = menuItems.find(item => item._id === itemId);
      if (!itemToUpdate) return;

      const response = await fetch('/api/restaurant/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: itemId,
          isAvailable: !currentStatus
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Update item in list
        setMenuItems(prev => 
          prev.map(item => 
            item._id === itemId ? data.data : item
          )
        );
        alert(`✅ Item ${!currentStatus ? 'enabled' : 'disabled'}!`);
      }
    } catch (error) {
      console.error('Toggle availability error:', error);
      alert('Failed to update availability');
    }
  };

  // Get unique categories for filter
  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  
  // Filter menu items
  const filteredItems = filterCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === filterCategory);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} cartCount={0} showCart={false} />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/restaurant')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
            <p className="text-gray-600">Manage your restaurant menu items</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700"
          >
            <Plus className="w-5 h-5" />
            Add New Item
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border">
            <p className="text-gray-600">Total Items</p>
            <p className="text-3xl font-bold">{menuItems.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <p className="text-gray-600">Available</p>
            <p className="text-3xl font-bold text-green-600">
              {menuItems.filter(item => item.isAvailable).length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <p className="text-gray-600">Categories</p>
            <p className="text-3xl font-bold">{categories.length - 1}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <p className="text-gray-600">Avg. Price</p>
            <p className="text-3xl font-bold">
              ${(menuItems.reduce((sum, item) => sum + item.price, 0) / (menuItems.length || 1)).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Add New Item Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl p-8 mb-8 border border-gray-200 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Add New Menu Item</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={newItem.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Margherita Pizza"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={newItem.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="Appetizer">Appetizer</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Side Dish">Side Dish</option>
                  <option value="Salad">Salad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={newItem.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="12.99"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={newItem.isAvailable}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="ml-2 text-gray-700">Available for ordering</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newItem.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Describe your delicious dish..."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={addMenuItem}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                Add to Menu
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="flex items-center gap-4 mb-6">
          <Filter className="w-5 h-5 text-gray-500" />
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  filterCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border hover:bg-gray-50'
                }`}
              >
                {category === 'all' ? 'All Items' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items List */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {filteredItems.length > 0 ? (
            <div className="divide-y">
              {filteredItems.map((item) => (
                <div key={item._id} className="p-6 hover:bg-gray-50">
                  {editingItem?._id === item._id ? (
                    // Edit Form
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="name"
                          value={editingItem.name}
                          onChange={handleEditInputChange}
                          className="px-4 py-2 border rounded-lg"
                          placeholder="Item name"
                        />
                        <input
                          type="number"
                          name="price"
                          value={editingItem.price}
                          onChange={handleEditInputChange}
                          className="px-4 py-2 border rounded-lg"
                          placeholder="Price"
                          step="0.01"
                          min="0"
                        />
                        <select
                          name="category"
                          value={editingItem.category}
                          onChange={handleEditInputChange}
                          className="px-4 py-2 border rounded-lg"
                        >
                          <option value="Appetizer">Appetizer</option>
                          <option value="Main Course">Main Course</option>
                          <option value="Dessert">Dessert</option>
                          <option value="Beverage">Beverage</option>
                        </select>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="isAvailable"
                            checked={editingItem.isAvailable}
                            onChange={handleEditInputChange}
                            className="w-4 h-4 mr-2"
                          />
                          Available
                        </label>
                      </div>
                      <textarea
                        name="description"
                        value={editingItem.description}
                        onChange={handleEditInputChange}
                        className="w-full px-4 py-2 border rounded-lg"
                        rows="2"
                        placeholder="Description"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={updateMenuItem}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          <Save className="w-4 h-4" />
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Item Display
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{item.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.isAvailable 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{item.description}</p>
                        <p className="text-2xl font-bold text-gray-900">${item.price.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleAvailability(item._id, item.isAvailable)}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            item.isAvailable
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {item.isAvailable ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => setEditingItem(item)}
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteMenuItem(item._id)}
                          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {filterCategory === 'all' 
                  ? 'No menu items yet' 
                  : `No items in ${filterCategory} category`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filterCategory === 'all' 
                  ? 'Add your first menu item to get started' 
                  : 'Try another category or add new items'}
              </p>
              {filterCategory !== 'all' && (
                <button
                  onClick={() => setFilterCategory('all')}
                  className="text-green-600 hover:text-green-800 font-medium"
                >
                  Show All Items
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Menu Management Tips</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              Keep prices competitive but profitable
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              Update availability based on ingredients
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              Use clear, appealing descriptions
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              Group similar items in same categories
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}