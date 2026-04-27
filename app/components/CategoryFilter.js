'use client';

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  const commonCategories = [
    { id: 'all', name: 'All', icon: '🍕' },
    { id: 'pizza', name: 'Pizza', icon: '🍕' },
    { id: 'burger', name: 'Burgers', icon: '🍔' },
    { id: 'sushi', name: 'Sushi', icon: '🍣' },
    { id: 'mexican', name: 'Mexican', icon: '🌮' },
    { id: 'indian', name: 'Indian', icon: '🍛' },
    { id: 'chinese', name: 'Chinese', icon: '🥡' },
    { id: 'italian', name: 'Italian', icon: '🍝' },
  ];

  // Normalize incoming categories (from restaurants) and merge with common ones.
  // This makes matching case-insensitive (e.g. 'Italian' -> 'italian').
  const normalizedPropCategories = (categories || [])
    .filter(Boolean)
    .map((c) => {
      const name = String(c);
      const id = name.toLowerCase();
      return { id, name: name.charAt(0).toUpperCase() + name.slice(1), icon: '🍽️' };
    });

  const merged = new Map();
  // add common first
  for (const cat of commonCategories) merged.set(cat.id, cat);
  // then add/overwrite with normalized prop categories
  for (const cat of normalizedPropCategories) merged.set(cat.id, cat);

  const displayCategories = Array.from(merged.values());

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
      {displayCategories.map((category) => {
        const isActive = String(selectedCategory || '').toLowerCase() === category.id;
        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            <span className="text-xl">{category.icon}</span>
            <span className="font-medium whitespace-nowrap">{category.name}</span>
          </button>
        );
      })}
    </div>
  );
}