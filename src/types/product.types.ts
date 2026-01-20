export interface ProductRating {
  average: number; // 0-5
  count: number; // Total number of reviews
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number; // For showing discounted prices
  image: string;
  rating: ProductRating;
  inStock?: boolean;
  badge?: string; // e.g., "New", "Sale", "Limited"
  category?: string;
}

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
  onProductClick?: (productId: string) => void;
  isLoading?: boolean;
}
