import { useState, useMemo } from 'react';
import { ProductCard } from '../ui/ProductCard';
import type { Product } from '../../types/product.types';

const sampleProducts: Product[] = [
  {
    id: '1',
    title: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling headphones with 30-hour battery life and crystal clear audio quality.',
    price: 199.99,
    originalPrice: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    rating: {
      average: 4.5,
      count: 1234,
    },
    inStock: true,
    badge: 'Sale',
    category: 'Electronics',
  },
  {
    id: '2',
    title: 'Smart Watch Pro',
    description: 'Advanced fitness tracking, heart rate monitor, GPS, and smartphone notifications all in one sleek design.',
    price: 349.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    rating: {
      average: 4.8,
      count: 856,
    },
    inStock: true,
    badge: 'New',
    category: 'Wearables',
  },
  {
    id: '3',
    title: 'Portable Laptop Stand',
    description: 'Ergonomic aluminum stand that elevates your laptop for better posture and improved airflow.',
    price: 49.99,
    originalPrice: 79.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
    rating: {
      average: 4.2,
      count: 567,
    },
    inStock: true,
    badge: 'Limited',
    category: 'Office',
  },
  {
    id: '4',
    title: 'Mechanical Keyboard RGB',
    description: 'Cherry MX switches, per-key RGB lighting, and premium build quality for the ultimate typing experience.',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=500&fit=crop',
    rating: {
      average: 4.7,
      count: 942,
    },
    inStock: true,
    category: 'Electronics',
  },
  {
    id: '5',
    title: 'Wireless Mouse Ergonomic',
    description: 'Comfortable ergonomic design with precision tracking and long battery life for productivity.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop',
    rating: {
      average: 4.3,
      count: 423,
    },
    inStock: false,
    category: 'Electronics',
  },
  {
    id: '6',
    title: 'USB-C Hub Multiport',
    description: 'Connect multiple devices with 7 ports including HDMI, USB 3.0, SD card reader, and power delivery.',
    price: 89.99,
    originalPrice: 119.99,
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&h=500&fit=crop',
    rating: {
      average: 4.6,
      count: 678,
    },
    inStock: true,
    badge: 'Sale',
    category: 'Electronics',
  },
  {
    id: '7',
    title: '4K Webcam HD',
    description: 'Ultra HD video quality with auto-focus, low-light correction, and built-in microphone for crystal clear video calls.',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=500&h=500&fit=crop',
    rating: {
      average: 4.4,
      count: 321,
    },
    inStock: true,
    badge: 'New',
    category: 'Electronics',
  },
  {
    id: '8',
    title: 'Standing Desk Converter',
    description: 'Transform your desk into a standing workstation with adjustable height settings and spacious surface area.',
    price: 249.99,
    originalPrice: 349.99,
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=500&h=500&fit=crop',
    rating: {
      average: 4.9,
      count: 1156,
    },
    inStock: true,
    category: 'Office',
  },
  {
    id: '9',
    title: 'Noise Cancelling Earbuds',
    description: 'Compact wireless earbuds with active noise cancellation, touch controls, and all-day battery life.',
    price: 179.99,
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500&h=500&fit=crop',
    rating: {
      average: 4.1,
      count: 789,
    },
    inStock: true,
    category: 'Electronics',
  },
];

export const ProductCardDemo = () => {
  const [loadingProducts, setLoadingProducts] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<string[]>([]);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const categories = ['All', ...Array.from(new Set(sampleProducts.map(p => p.category || 'Other')))];

  const handleAddToCart = async (productId: string) => {
    setLoadingProducts((prev) => new Set(prev).add(productId));
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCart((prev) => [...prev, productId]);
    setLoadingProducts((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  const handleProductClick = (productId: string) => {
    console.log(`Navigating to product details: ${productId}`);
  };

  const filteredProducts = useMemo(() => {
    return sampleProducts.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesMinPrice = priceRange.min === '' || product.price >= Number(priceRange.min);
      const matchesMaxPrice = priceRange.max === '' || product.price <= Number(priceRange.max);
      
      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'rating': return b.rating.average - a.rating.average;
        default: return 0;
      }
    });
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setPriceRange({ min: '', max: '' });
    setSortBy('default');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
              Products
            </h1>
            {cart.length > 0 && (
              <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full">
                <span className="font-semibold">{cart.length}</span>
                <span className="hidden sm:inline">item{cart.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </header>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              aria-label="Search products"
            />
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              aria-label="Filter by category"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Price"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                aria-label="Minimum price"
              />
              <input
                type="number"
                placeholder="Max Price"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                aria-label="Maximum price"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              aria-label="Sort products"
            >
              <option value="default">Default Sorting</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>
          
          <div className="mt-4 flex justify-end">
             <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
             >
                Clear all filters
             </button>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 mb-8">
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onProductClick={handleProductClick}
                  isLoading={loadingProducts.has(product.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 items-center">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 dark:border-gray-700 dark:text-white"
                  aria-label="Previous page"
                >
                  Previous
                </button>
                <span className="text-gray-700 dark:text-gray-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 dark:border-gray-700 dark:text-white"
                  aria-label="Next page"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              No products found matching your criteria.
            </p>
            <button
                onClick={clearFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
