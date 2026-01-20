import React, { useState } from 'react';
import type { ProductCardProps } from '../../types/product.types';
import { StarRating } from './StarRating';

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onProductClick,
  isLoading = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onAddToCart && !isLoading && product.inStock !== false) {
      onAddToCart(product.id);
    }
  };

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product.id);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const discountPercentage =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <article
      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      role="article"
      aria-label={`Product: ${product.title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-100 aspect-square">
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                product.badge.toLowerCase() === 'sale' || product.badge.toLowerCase() === 'limited'
                  ? 'bg-red-500'
                  : product.badge.toLowerCase() === 'new'
                  ? 'bg-green-500'
                  : 'bg-blue-500'
              }`}
            >
              {product.badge}
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {discountPercentage && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2 py-1 rounded-md text-xs font-bold text-white bg-red-600">
              -{discountPercentage}%
            </span>
          </div>
        )}

        {/* Product Image */}
        {!imageError ? (
          <>
            <img
              src={product.image}
              alt={product.title}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isHovered ? 'scale-110' : 'scale-100'
              } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
              loading="lazy"
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-label="Image not available"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {product.inStock === false && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20">
            <span className="px-4 py-2 bg-gray-800 text-white font-semibold rounded-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick View Overlay (on hover) */}
        <div
          className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center z-10 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        >
          <span className="text-white font-semibold text-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            Quick View
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-5">
        {/* Title */}
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-blue-600 transition-colors duration-200">
          {product.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={product.rating.average} size="sm" />
          <span className="text-xs text-gray-500" aria-label={`${product.rating.count} reviews`}>
            ({product.rating.count})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-2xl font-bold text-gray-900" aria-label={`Price: ${formatPrice(product.price)}`}>
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span
                className="text-lg text-gray-400 line-through"
                aria-label={`Original price: ${formatPrice(product.originalPrice)}`}
              >
                {formatPrice(product.originalPrice)}
              </span>
              <span className="sr-only">
                Discounted from {formatPrice(product.originalPrice)} to {formatPrice(product.price)}
              </span>
            </>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isLoading || product.inStock === false}
          className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 transform ${
            product.inStock === false
              ? 'bg-gray-400 cursor-not-allowed'
              : isLoading
              ? 'bg-blue-400 cursor-wait'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95 hover:shadow-lg'
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50`}
          aria-label={`Add ${product.title} to cart`}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Adding...</span>
            </span>
          ) : product.inStock === false ? (
            'Out of Stock'
          ) : (
            <span className="flex items-center justify-center gap-2">
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Add to Cart
            </span>
          )}
        </button>
      </div>
    </article>
  );
};

