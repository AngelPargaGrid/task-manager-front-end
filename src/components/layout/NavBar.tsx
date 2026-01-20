import React, { useState, useEffect, useRef } from 'react';
import type { NavBarProps } from '../../types/navigation.types';

export const NavBar: React.FC<NavBarProps> = ({
  logo,
  menuItems,
  user,
  onSearch,
  onMenuItemClick,
  onProfileClick,
  onLogout,
  currentPath = typeof window !== 'undefined' ? window.location.pathname : '/',
  searchPlaceholder = 'Search...',
  searchSuggestions,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchSuggestionsList, setSearchSuggestionsList] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Enable smooth scroll behavior globally
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Handle scroll for sticky effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch search suggestions
  useEffect(() => {
    if (searchSuggestions && searchQuery.trim().length > 0) {
      const fetchSuggestions = async () => {
        try {
          const suggestions = await Promise.resolve(searchSuggestions(searchQuery));
          setSearchSuggestionsList(Array.isArray(suggestions) ? suggestions : []);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error fetching search suggestions:', error);
          setSearchSuggestionsList([]);
        }
      };
      
      const debounceTimer = setTimeout(fetchSuggestions, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSearchSuggestionsList([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, searchSuggestions]);

  // Close search suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsProfileDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleMenuItemClick = (href: string, e?: React.MouseEvent) => {
    // Handle smooth scroll for anchor links
    if (href.startsWith('#')) {
      e?.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        const offsetTop = (element as HTMLElement).offsetTop - 80; // Account for navbar height
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth',
        });
      }
    } else {
      // Handle regular navigation
      if (onMenuItemClick) {
        onMenuItemClick(href);
      }
    }
    setIsMobileMenuOpen(false);
  };

  const isActiveLink = (href: string): boolean => {
    if (href === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(href);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion);
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    }
    setIsProfileDropdownOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setIsProfileDropdownOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white shadow-lg py-2'
            : 'bg-white/95 backdrop-blur-md py-3'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              {typeof logo === 'string' ? (
                <a
                  href="/"
                  className="flex items-center space-x-2 text-xl sm:text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                  aria-label="Home"
                >
                  <span>{logo}</span>
                </a>
              ) : (
                <div className="flex items-center">{logo}</div>
              )}
            </div>

            {/* Desktop Menu Items */}
            <div className="hidden lg:flex lg:items-center lg:space-x-1">
              {menuItems.map((item) => {
                const isActive = isActiveLink(item.href);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      if (!item.href.startsWith('#')) {
                        e.preventDefault();
                      }
                      handleMenuItemClick(item.href, e);
                    }}
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 group ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 font-semibold'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    aria-label={item.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.icon && <span className="text-lg">{item.icon}</span>}
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                    )}
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8" ref={searchRef}>
              <form
                onSubmit={handleSearch}
                className="w-full relative"
                role="search"
              >
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    if (searchSuggestionsList.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    setIsSearchFocused(false);
                    // Delay hiding suggestions to allow click events
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  placeholder={searchPlaceholder}
                  className={`w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none transition-all duration-200 ${
                    isSearchFocused
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-300 focus:border-blue-400'
                  }`}
                  aria-label="Search"
                  aria-autocomplete="list"
                  aria-expanded={showSuggestions}
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                  aria-label="Submit search"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
                
                {/* Search Suggestions Dropdown */}
                {showSuggestions && searchSuggestionsList.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-64 overflow-y-auto z-50 animate-fade-in">
                    {searchSuggestionsList.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                        role="option"
                      >
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>

            {/* User Profile / Actions */}
            <div className="flex items-center space-x-4">
              {/* Search Icon - Mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle search"
                aria-expanded={isMobileMenuOpen}
              >
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* User Profile Dropdown */}
              {user ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="User menu"
                    aria-expanded={isProfileDropdownOpen}
                    aria-haspopup="true"
                  >
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300 hover:border-blue-500 transition-colors object-cover"
                    />
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {user.name}
                    </span>
                    <svg
                      className={`hidden sm:block w-4 h-4 text-gray-500 transition-transform duration-200 ${
                        isProfileDropdownOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Profile Dropdown Menu */}
                  <div
                    className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 transform transition-all duration-200 origin-top-right ${
                      isProfileDropdownOpen
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                    }`}
                    role="menu"
                    aria-orientation="vertical"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      {user.role && (
                        <p className="text-xs text-blue-600 mt-1">{user.role}</p>
                      )}
                    </div>

                    {/* Menu Items */}
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                      role="menuitem"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      My Profile
                    </button>
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                      role="menuitem"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Settings
                    </button>
                    <div className="border-t border-gray-200 my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      role="menuitem"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleMenuItemClick('/login')}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleMenuItemClick('/signup')}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span
                    className={`bg-gray-700 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                      isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
                    }`}
                  />
                  <span
                    className={`bg-gray-700 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${
                      isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                  <span
                    className={`bg-gray-700 block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${
                      isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`lg:hidden fixed inset-0 bg-black/50 transition-opacity duration-300 z-40 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          className={`lg:hidden fixed top-16 sm:top-20 left-0 right-0 bottom-0 bg-white z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          <div className="p-4 space-y-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Search"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                aria-label="Submit search"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
              
              {/* Mobile Search Suggestions */}
              {showSuggestions && searchSuggestionsList.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-48 overflow-y-auto z-50">
                  {searchSuggestionsList.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </form>

            {/* Mobile Menu Items */}
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = isActiveLink(item.href);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => {
                      if (!item.href.startsWith('#')) {
                        e.preventDefault();
                      }
                      handleMenuItemClick(item.href, e);
                    }}
                    className={`flex items-center justify-between px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'text-blue-600 bg-blue-50 font-semibold border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && <span className="text-xl">{item.icon}</span>}
                      <span>{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>

            {/* Mobile User Section */}
            {user && (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="text-left">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content from being hidden under fixed nav */}
      <div className="h-16 sm:h-20" />
    </>
  );
};

