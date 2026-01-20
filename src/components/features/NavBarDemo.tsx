import { useState, useEffect } from 'react';
import { NavBar } from '../layout/NavBar';
import type { NavBarProps } from '../../types/navigation.types';
import { ProductCardDemo } from './ProductCardDemo';
import { UserProfileDemo } from './UserProfileDemo';

export const NavBarDemo = () => {
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  
  // Mock search suggestions data
  const searchSuggestionsData = [
    'Wireless Headphones',
    'Laptop Stand',
    'Mechanical Keyboard',
    'Webcam HD',
    'USB-C Hub',
    'Wireless Mouse',
    'Standing Desk',
    'Monitor Mount',
    'Desk Mat',
    'Cable Management',
  ];

  // Simulate search suggestions
  const getSearchSuggestions = (query: string): string[] => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return searchSuggestionsData
      .filter(item => item.toLowerCase().includes(lowerQuery))
      .slice(0, 5);
  };

  const menuItems: NavBarProps['menuItems'] = [
    {
      label: 'Home',
      href: '#home',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      label: 'Products',
      href: '#products',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: 'About',
      href: '#about',
    },
    {
      label: 'Features',
      href: '#features',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Contact',
      href: '#contact',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Notifications',
      href: '/notifications',
      badge: 3,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
  ];

  // Update current path when hash changes (for anchor links)
  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.hash || '/');
    };
    updatePath();
    window.addEventListener('hashchange', updatePath);
    return () => window.removeEventListener('hashchange', updatePath);
  }, []);

  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe',
    role: 'Administrator',
  };

  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    setSearchResults([`Results for: "${query}"`]);
    // In a real app, this would perform an actual search
    setTimeout(() => setSearchResults([]), 3000);
  };

  const handleMenuItemClick = (href: string) => {
    console.log('Navigating to:', href);
    // In a real app, this would use a router
  };

  const handleProfileClick = () => {
    console.log('Opening profile');
    alert('Profile page would open here');
  };

  const handleLogout = () => {
    console.log('Logging out');
    alert('User logged out');
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Tasks Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            This page demonstrates the NavBar component features
          </p>
        </div>
        
        <NavBar
          logo={
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BrandName
            </span>
          }
          menuItems={menuItems}
          user={user}
          onSearch={handleSearch}
          onMenuItemClick={handleMenuItemClick}
          onProfileClick={handleProfileClick}
          onLogout={handleLogout}
          currentPath={currentPath}
          searchPlaceholder="Search products..."
          searchSuggestions={getSearchSuggestions}
        />

        {/* Search Results Toast */}
      {searchResults.length > 0 && (
        <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-lg px-6 py-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-900">{searchResults[0]}</p>
          </div>
        </div>
      )}
      
      {/* Instructions */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 mx-4">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-yellow-700">
            <p className="font-semibold mb-1">Try these features:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Click navigation links to see smooth scrolling and active link highlighting</li>
              <li>Type in the search bar to see autocomplete suggestions appear</li>
              <li>Scroll the page to see the navigation bar's sticky behavior</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section id="hero" className="pt-16 pb-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Responsive Navigation Bar
          </h1>
          <p className="text-xl sm:text-2xl mb-8 text-blue-100">
            Try the new features: Active link highlighting, smooth scroll, and search suggestions!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              Get Started
            </button>
            <button className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Learn More
            </button>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto text-left">
            <h3 className="text-lg font-semibold mb-3">New Features:</h3>
            <ul className="space-y-2 text-sm text-blue-100">
              <li className="flex items-start gap-2">
                <span className="text-green-300 mt-1">✓</span>
                <span><strong>Active Link Highlighting:</strong> Navigation links are automatically highlighted based on current section</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-300 mt-1">✓</span>
                <span><strong>Smooth Scroll:</strong> Click navigation links to smoothly scroll to sections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-300 mt-1">✓</span>
                <span><strong>Search Suggestions:</strong> Type in the search bar to see autocomplete suggestions</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Home Section */}
      <section id="home" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Home Section</h2>
          <UserProfileDemo />
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto">
          <ProductCardDemo />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">About Section</h2>
          <p className="text-gray-600 leading-relaxed">
            Try typing in the search bar to see search suggestions appear. The search functionality
            includes a placeholder with autocomplete suggestions that filter as you type.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-purple-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Features Section</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">Active Link Highlighting</h3>
              <p className="text-gray-600 text-sm">
                Navigation links are automatically highlighted based on the current section.
                Active links have a blue background and bold text.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">Smooth Scroll</h3>
              <p className="text-gray-600 text-sm">
                Clicking anchor links smoothly scrolls to the target section with
                proper offset for the fixed navigation bar.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">Search Suggestions</h3>
              <p className="text-gray-600 text-sm">
                Type in the search bar to see autocomplete suggestions appear.
                Click on any suggestion to search for that term.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2">Responsive Design</h3>
              <p className="text-gray-600 text-sm">
                The navigation bar adapts beautifully to all screen sizes with
                a mobile-friendly hamburger menu.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Section</h2>
          <p className="text-gray-600 leading-relaxed">
            This is the contact section. Scroll back to the top to see how the navigation bar
            changes its appearance when you scroll past the hero section.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 mb-4">
            Navigation Bar Component Demo - All features demonstrated
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <span>✓ Active Link Highlighting</span>
            <span>✓ Smooth Scroll Behavior</span>
            <span>✓ Search Suggestions</span>
            <span>✓ Responsive Design</span>
            <span>✓ Sticky Navigation</span>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

