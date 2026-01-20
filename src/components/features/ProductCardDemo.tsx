import { useState } from 'react';
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
  },
];

export const ProductCardDemo = () => {
  const [loadingProducts, setLoadingProducts] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<string[]>([]);

  const handleAddToCart = async (productId: string) => {
    setLoadingProducts((prev) => new Set(prev).add(productId));

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setCart((prev) => [...prev, productId]);
    setLoadingProducts((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });

    // Show notification (in a real app, you'd use a toast library)
    const product = sampleProducts.find((p) => p.id === productId);
    if (product) {
      console.log(`Added ${product.title} to cart`);
    }
  };

  const handleProductClick = (productId: string) => {
    console.log(`Navigating to product details: ${productId}`);
    // In a real app, this would navigate to the product detail page
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
              Product Card Component Demo
            </h1>
            {cart.length > 0 && (
              <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="font-semibold">{cart.length}</span>
                <span className="hidden sm:inline">item{cart.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Showcasing the ProductCard component with various product scenarios
          </p>
        </header>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
          {sampleProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ProductCard
                product={product}
                onAddToCart={handleAddToCart}
                onProductClick={handleProductClick}
                isLoading={loadingProducts.has(product.id)}
              />
            </div>
          ))}
        </div>

        {/* Features Section */}
        <section className="mt-16 bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Component Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Product Information
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• High-quality product image with lazy loading</li>
                <li>• Product title and description</li>
                <li>• Price display with discount support</li>
                <li>• Star rating with review count</li>
                <li>• Stock status indicator</li>
                <li>• Product badges (Sale, New, Limited)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Interactive Features
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Add to Cart button with loading state</li>
                <li>• Clickable card for product details</li>
                <li>• Hover effects and animations</li>
                <li>• Image zoom on hover</li>
                <li>• Quick view overlay</li>
                <li>• Disabled state for out of stock</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Responsive Design
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• Mobile-first approach</li>
                <li>• Responsive grid layout</li>
                <li>• Adaptive spacing and typography</li>
                <li>• Touch-friendly interactions</li>
                <li>• Optimized for all screen sizes</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Accessibility
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• ARIA labels and roles</li>
                <li>• Keyboard navigation support</li>
                <li>• Screen reader friendly</li>
                <li>• Focus management</li>
                <li>• Semantic HTML structure</li>
                <li>• Alt text for images</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

