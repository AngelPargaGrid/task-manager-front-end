export interface NavMenuItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: number; // For notification badges
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  role?: string;
}

export interface NavBarProps {
  logo: string | React.ReactNode;
  menuItems: NavMenuItem[];
  user?: UserProfile;
  onSearch?: (query: string) => void;
  onMenuItemClick?: (href: string) => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  currentPath?: string; // For active link highlighting
  searchPlaceholder?: string; // Custom search placeholder
  searchSuggestions?: (query: string) => Promise<string[]> | string[]; // Search suggestions function
}

